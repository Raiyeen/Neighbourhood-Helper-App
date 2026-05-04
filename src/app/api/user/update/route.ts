import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, profession, profilePicture, address } = body;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(profession && { profession }),
        ...(address && { address }),
        ...(profilePicture && { profilePicture })
      }
    });

    return NextResponse.json({ message: 'Profile updated', user: { name: updatedUser.name, profilePicture: updatedUser.profilePicture } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
