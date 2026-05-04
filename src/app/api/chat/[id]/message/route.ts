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

    const conversationId = parseInt((await params).id);
    const { content, imageUrl } = await request.json();

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });

    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (conv.user1Id !== decoded.userId && conv.user2Id !== decoded.userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
         conversationId,
         senderId: decoded.userId,
         content,
         imageUrl
      }
    });

    // We can also trigger Notification creation here
    const recipientId = conv.user1Id === decoded.userId ? conv.user2Id : conv.user1Id;
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        userId: recipientId,
        senderId: decoded.userId,
        sourceId: conv.id
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
