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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const postId = Number(resolvedParams.id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (post.authorId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const postId = Number(resolvedParams.id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (post.authorId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { title, description, accessories, imageUrl, urgency } = body;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, description, accessories, imageUrl, urgency }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const postId = Number(resolvedParams.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
