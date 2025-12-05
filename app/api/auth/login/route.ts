import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { getAllSecurityHeaders } from '@/lib/security';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'developer';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tokita2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = await signToken({ role: 'admin', user: username });
      
      return NextResponse.json(
        { status: 'success', token },
        { headers: getAllSecurityHeaders() }
      );
    } else {
      // Delay response to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json(
        { status: 'error', message: 'Invalid credentials' },
        { status: 401, headers: getAllSecurityHeaders() }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500, headers: getAllSecurityHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: getAllSecurityHeaders() });
}
