import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversationId = parseInt((await params).id);

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: { select: { id: true, name: true, profilePicture: true } },
        user2: { select: { id: true, name: true, profilePicture: true } },
        messages: {
           orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (conv.user1Id !== decoded.userId && conv.user2Id !== decoded.userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark messages as read
    await prisma.message.updateMany({
       where: { conversationId, senderId: { not: decoded.userId }, isRead: false },
       data: { isRead: true }
    });

    return NextResponse.json(conv);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
