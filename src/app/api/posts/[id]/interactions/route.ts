import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const postId = parseInt((await params).id);
    
    // Fetch likes with author info
    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        author: { select: { name: true, profilePicture: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch ratings with author info
    const ratings = await prisma.rating.findMany({
      where: { postId },
      include: {
        author: { select: { name: true, profilePicture: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch all comments and build infinite tree
    const allComments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { name: true, profilePicture: true } },
      },
      orderBy: { createdAt: 'asc' } // oldest first to build tree
    });

    const commentMap = new Map();
    allComments.forEach(c => commentMap.set(c.id, { ...c, replies: [] }));

    const comments: any[] = [];
    allComments.forEach(c => {
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId).replies.push(commentMap.get(c.id));
      } else {
        comments.push(commentMap.get(c.id));
      }
    });

    // Sort top-level comments mostly recent first
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ likes, ratings, comments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
