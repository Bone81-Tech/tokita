import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllSecurityHeaders } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401, headers: getAllSecurityHeaders() }
      );
    }

    const payload = await verifyToken(token);

    if (payload) {
      return NextResponse.json(
        { status: 'success', payload },
        { headers: getAllSecurityHeaders() }
      );
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
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
