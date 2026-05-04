import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    const contactMsg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message
      }
    });

    return NextResponse.json(contactMsg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact message' }, { status: 500 });
  }
}
