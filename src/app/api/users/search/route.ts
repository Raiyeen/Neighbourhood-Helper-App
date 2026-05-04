import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: number } | null;
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q || q.length < 2) return NextResponse.json([]);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { name: { contains: q } },
          { id: { not: decoded.userId } }
        ]
      },
      select: {
         id: true,
         name: true,
         profilePicture: true,
      },
      take: 10
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
