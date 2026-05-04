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

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      include: {
         // Because senderId is an integer, we must manually join or use raw query.
         // Wait, the schema does NOT have a relation for sender! 
         // Let's modify schema or we can do manual fetch.
         // Actually, let's just fetch the users manually for the notifications to avoid schema migration.
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const senderIds = Array.from(new Set(notifications.map(n => n.senderId).filter(Boolean))) as number[];
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, profilePicture: true }
    });

    const senderMap = new Map(senders.map(s => [s.id, s]));
    
    const enrichedNotifications = notifications.map(n => ({
      ...n,
      sender: n.senderId ? senderMap.get(n.senderId) : null
    }));

    return NextResponse.json(enrichedNotifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Mark as read
    await prisma.notification.updateMany({
      where: { userId: decoded.userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
