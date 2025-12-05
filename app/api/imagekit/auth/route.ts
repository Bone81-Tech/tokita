import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllSecurityHeaders } from '@/lib/security';

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';

// Helper to verify authentication
async function checkAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return false;
  
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function GET(request: NextRequest) {
  // Verify authentication
  const isAuthenticated = await checkAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401, headers: getAllSecurityHeaders() }
    );
  }

  try {
    const crypto = require('crypto');
    
    const token = crypto.randomBytes(16).toString('hex');
    const expire = Date.now() + 600000; // 10 minutes
    
    const signature = crypto
      .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
      .update(token + expire)
      .digest('hex');

    return NextResponse.json(
      { signature, expire, token },
      { headers: getAllSecurityHeaders() }
    );
  } catch (error) {
    console.error('ImageKit Auth Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to generate auth params' },
      { status: 500, headers: getAllSecurityHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: getAllSecurityHeaders() });
}
