import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  return NextResponse.json({
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    accessTokenPreview: accessToken?.substring(0, 20) + '...',
    phoneNumberId: phoneNumberId,
    phoneNumberIdLength: phoneNumberId?.length || 0,
  });
}
