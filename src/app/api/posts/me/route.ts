import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const posts = await prisma.post.findMany({
      where: { authorId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, profilePicture: true }
        },
        likes: { where: { authorId: decoded.userId }, select: { id: true } },
        ratings: { where: { authorId: decoded.userId }, select: { id: true } },
        _count: {
          select: { comments: true, likes: true, ratings: true }
        }
      }
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personal posts' }, { status: 500 });
  }
}
