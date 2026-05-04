import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token) as { userId: number } | null;
  return decoded?.userId;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    let userArea = "";
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { address: true } });
      if (user && user.address) userArea = user.address;
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, profilePicture: true }
        },
        likes: userId ? { where: { authorId: userId }, select: { id: true } } : undefined,
        ratings: userId ? { where: { authorId: userId }, select: { id: true } } : undefined,
        _count: {
          select: { comments: true, likes: true, ratings: true }
        }
      }
    });

    if (userArea) {
      // Geo-targeted sort: User area first
      posts.sort((a, b) => {
        const aLocal = a.areaName.toLowerCase() === userArea.toLowerCase() || a.areaName.toLowerCase().includes(userArea.toLowerCase());
        const bLocal = b.areaName.toLowerCase() === userArea.toLowerCase() || b.areaName.toLowerCase().includes(userArea.toLowerCase());
        if (aLocal && !bLocal) return -1;
        if (!aLocal && bLocal) return 1;
        return 0; // maintain descending date order otherwise
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, areaName, accessories, imageUrl, urgency } = body;

    const post = await prisma.post.create({
      data: {
        title,
        description,
        areaName,
        accessories,
        imageUrl,
        urgency,
        authorId: userId
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
