import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    // Create a backup of the current db before overwriting
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, `${dbPath}.bak`);
    }

    try {
        await writeFile(dbPath, buffer);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error restoring database:', error);
        return NextResponse.json({ error: 'Failed to restore database' }, { status: 500 });
    }
}
