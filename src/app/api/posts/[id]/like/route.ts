import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const postId = parseInt((await params).id);
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existingLike = await prisma.like.findUnique({
      where: {
        authorId_postId: { authorId: decoded.userId, postId }
      }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { authorId: decoded.userId, postId }
      });

      // Notification
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post && post.authorId !== decoded.userId) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            senderId: decoded.userId,
            type: 'LIKE',
            sourceId: postId
          }
        });
      }
    }

    const likesCount = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ likes: likesCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
