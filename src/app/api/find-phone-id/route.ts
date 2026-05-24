import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!accessToken) {
    return NextResponse.json({
      error: "WHATSAPP_ACCESS_TOKEN not configured in .env.local"
    }, { status: 500 });
  }

  const results: any = {
    tokenFound: true,
    methods: []
  };

  // Method 1: Using Business Account ID
  if (businessAccountId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${businessAccountId}/phone_numbers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.data) {
        results.methods.push({
          method: "Business Account ID",
          success: true,
          phoneNumbers: data.data.map((phone: any) => ({
            id: phone.id,
            displayNumber: phone.display_phone_number,
            verifiedName: phone.verified_name,
            qualityRating: phone.quality_rating
          }))
        });
      } else {
        results.methods.push({
          method: "Business Account ID",
          success: false,
          error: data.error?.message
        });
      }
    } catch (error: any) {
      results.methods.push({
        method: "Business Account ID",
        success: false,
        error: error.message
      });
    }
  }

  // Method 2: Debug token
  try {
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );

    const debugData = await debugResponse.json();

    if (debugData.data) {
      results.tokenInfo = {
        appId: debugData.data.app_id,
        isValid: debugData.data.is_valid,
        expiresAt: debugData.data.expires_at === 0 ? 'Never' : new Date(debugData.data.expires_at * 1000).toISOString(),
        scopes: debugData.data.granular_scopes?.map((s: any) => s.scope) || debugData.data.scopes
      };
    }
  } catch (error: any) {
    results.tokenInfoError = error.message;
  }

  return NextResponse.json(results);
}