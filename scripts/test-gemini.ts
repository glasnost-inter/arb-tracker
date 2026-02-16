import { GoogleGenerativeAI } from '@google/generative-ai';
// import * as dotenv from 'dotenv';
// dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('GOOGLE_API_KEY not found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: listModels is not directly available on the client instance in some versions, 
        // but let's try to infer or just test a simple generation with 'gemini-1.5-flash'.
        // Actually the error message in the UI suggested "Call ListModels to see the list of available models".
        // This method is usually available on the GoogleAIFileManager or via REST, but the SDK exposes it differently.
        // Let's just try to generate content with 'gemini-1.5-flash' and 'gemini-pro' to see which one works.

        console.log("Testing gemini-1.5-flash...");
        const modelFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        try {
            await modelFlash.generateContent("Hello");
            console.log("✅ gemini-1.5-flash IS working.");
        } catch (e: any) {
            console.log("❌ gemini-1.5-flash FAILED:", e.message);
        }

        console.log("Testing gemini-1.5-flash-latest...");
        const modelFlashLatest = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        try {
            await modelFlashLatest.generateContent("Hello");
            console.log("✅ gemini-1.5-flash-latest IS working.");
        } catch (e: any) {
            console.log("❌ gemini-1.5-flash-latest FAILED:", e.message);
        }

        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
        try {
            await modelPro.generateContent("Hello");
            console.log("✅ gemini-pro IS working.");
        } catch (e: any) {
            console.log("❌ gemini-pro FAILED:", e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
