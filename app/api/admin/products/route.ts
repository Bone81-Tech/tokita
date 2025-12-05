import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllSecurityHeaders } from '@/lib/security';

const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbyM0UUfQ7gAy9bLv4WF0wv9QKinnHi7IQ1TAFP6m2IbxVC5zF8m441eEXy5fQKJ2z6TEw/exec';

// Helper to verify authentication
async function checkAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return false;
  
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const isAuthenticated = await checkAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401, headers: getAllSecurityHeaders() }
    );
  }

  try {
    const body = await request.json();
    const { action, data, id } = body;

    // Forward request to Google Apps Script
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data, id }),
    });

    const result = await response.json();

    return NextResponse.json(result, { headers: getAllSecurityHeaders() });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500, headers: getAllSecurityHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: getAllSecurityHeaders() });
}
