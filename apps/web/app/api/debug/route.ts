import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET() {
  return NextResponse.json({
    env: {
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
  });
}
