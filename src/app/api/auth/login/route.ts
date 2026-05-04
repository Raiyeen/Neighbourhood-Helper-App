import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { emailOrPhone, password } = await request.json();

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Missing credentials.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = signToken({ userId: user.id });

    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture } 
    });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Failed to authenticate.' }, { status: 500 });
  }
}
