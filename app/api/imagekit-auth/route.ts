import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // For static exports, check for the Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized: No access token provided' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the access token by trying to get the user
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      console.error('Invalid access token:', error?.message || 'No user found');
      return NextResponse.json({ message: 'Unauthorized: Invalid access token' }, { status: 401 });
    }

    // User is authenticated, proceed with ImageKit auth generation
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
    const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!IMAGEKIT_PRIVATE_KEY) {
      console.error('ImageKit private key is not configured');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const authToken = crypto.randomBytes(32).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 1800; // Valid for 30 minutes (well under 1 hour limit)

    const signature = crypto.createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
      .update(authToken + expire)
      .digest('hex');

    return NextResponse.json({
      signature: signature,
      expire: expire,
      token: authToken,
      publicKey: IMAGEKIT_PUBLIC_KEY,
    });

  } catch (error: any) {
    console.error('Error in imagekit-auth API route:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}