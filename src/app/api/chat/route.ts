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

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: decoded.userId }, { user2Id: decoded.userId }]
      },
      include: {
        user1: { select: { id: true, name: true, profilePicture: true } },
        user2: { select: { id: true, name: true, profilePicture: true } },
        messages: {
           orderBy: { createdAt: 'desc' },
           take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await request.json();
    
    if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(targetUserId) } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (targetUser.id === decoded.userId) return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });

    // check if conversation exists
    let conv = await prisma.conversation.findFirst({
       where: {
          OR: [
             { user1Id: decoded.userId, user2Id: targetUser.id },
             { user1Id: targetUser.id, user2Id: decoded.userId }
          ]
       }
    });

    if (!conv) {
       conv = await prisma.conversation.create({
          data: {
             user1Id: decoded.userId,
             user2Id: targetUser.id
          }
       });
    }

    return NextResponse.json(conv);
  } catch(error) {
     return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
