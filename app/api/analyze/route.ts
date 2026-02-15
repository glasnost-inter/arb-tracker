import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File || formData.get('image') as File | null;
        const text = formData.get('text') as string | null;

        const apiKey = process.env.GOOGLE_API_KEY;
        console.log("Analyzing with API Key length:", apiKey ? apiKey.length : 0);

        if (!apiKey) {
            return NextResponse.json(
                { error: 'GOOGLE_API_KEY is not defined in environment variables' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.0-flash as it is available for this key
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt = `
        You are an expert IT Project Manager and System Analyst.
        Analyze the provided input (image of a diagram/document, PDF file, or text description) and extract information to populate a Project Submission Form.
        
        Return a JSON object with the following fields (and ONLY these fields):
        {
            "name": "Project Name (infer a short, clear title)",
            "description": "A comprehensive summary of the project, including scope and key features. Use HTML for formatting (e.g. <p>, <ul>, <li>).",
            "type": "One of: 'New Service', 'Major Change', 'Tech Refresh', 'Deprecation', 'Normal Change', 'Bug Fixing'. Infer based on complexity and nature.",
            "ownerSquad": "Infer the most likely owner squad name if mentioned (e.g. 'Payment Squad', 'Core Squad'). If unsure, leave empty or null.",
            "slaDuration": "Estimate a reasonable SLA target in workdays (integer) based on complexity (e.g., 5 for simple, 20 for complex)."
        }
        
        If the input is an image or PDF, describe what you see or read in the description as well.
        Do not include markdown code block markers (like \`\`\`json). Just return the raw JSON string.
        `;

        let result;
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: file.type,
                    },
                },
            ]);
        } else if (text) {
            result = await model.generateContent([prompt + `\n\nInput Text:\n${text}`]);
        } else {
            return NextResponse.json({ error: 'No image or text provided' }, { status: 400 });
        }

        const responseText = result.response.text();

        // Clean up markdown formatting if present
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(cleanedText);
            return NextResponse.json(data);
        } catch (e) {
            console.error("Failed to parse AI response:", responseText);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: responseText }, { status: 500 });
        }

    } catch (error: any) {
        console.error('AI Analysis Error:', error);

        // Check for Quota Exceeded / 429 errors from Google API
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exhausted')) {
            return NextResponse.json(
                { error: 'Quota exceeded. Please input manually.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
