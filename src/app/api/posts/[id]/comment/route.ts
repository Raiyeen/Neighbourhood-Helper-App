import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const postId = parseInt((await params).id);
    const { content, parentId } = body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: decoded.userId,
        parentId: parentId || null
      }
    });

    // Determine target user for notification
    let targetUserId = post.authorId;
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parentComment) targetUserId = parentComment.authorId;
    }

    if (targetUserId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          type: parentId ? 'REPLY' : 'COMMENT',
          userId: targetUserId,
          senderId: decoded.userId,
          sourceId: postId
        }
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
