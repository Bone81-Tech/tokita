// JWT utilities for authentication
import { authAPI } from '@/lib/api';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-super-aman-ganti-ini-di-prod-12345';

// Base64 URL encoding
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Base64 URL decoding
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(str, 'base64').toString();
}

// Sign JWT token
export async function signToken(payload: { role: string; user: string }): Promise<string> {
  const crypto = require('crypto');
  
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    })
  );

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${header}.${body}.${signature}`;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ role: string; user: string; exp: number } | null> {
  try {
    const crypto = require('crypto');
    const [headerB64, bodyB64, signatureB64] = token.split('.');

    if (!headerB64 || !bodyB64 || !signatureB64) return null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signatureB64 !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(bodyB64));

    // Check expiration
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch (error) {
    return null;
  }
}

// Client-side token management
export const tokenManager = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tokita_token');
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tokita_token', token);
  },

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('tokita_token');
    localStorage.removeItem('tokita_admin_session');
  },

  async isValid(): Promise<boolean> {
    const token = this.get();
    if (!token) return false;

    try {
      return await authAPI.verify(token);
    } catch {
      return false;
    }
  },
};
