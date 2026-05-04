import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, phone, gender, address, profession, password } = await request.json();

    if (!name || !email || !password || !phone || !gender || !address || !profession) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or phone already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        gender,
        address,
        profession,
        password: hashedPassword,
      }
    });

    const token = signToken({ userId: user.id });

    const response = NextResponse.json({ message: 'Signup successful', user: { id: user.id, name: user.name, email: user.email } });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 });
  }
}
