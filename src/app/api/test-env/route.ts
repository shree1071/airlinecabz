import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    adminPassword: process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV,
    hasPassword: !!process.env.ADMIN_PASSWORD,
    passwordLength: process.env.ADMIN_PASSWORD?.length || 0
  });
}
