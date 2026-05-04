import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/'
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
