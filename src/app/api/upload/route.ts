import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Parse formData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    // Return relative URL
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Upload Failed' }, { status: 500 });
  }
}
