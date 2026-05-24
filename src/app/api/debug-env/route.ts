import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    accessTokenLength: process.env.WHATSAPP_ACCESS_TOKEN?.length || 0,
  });
}