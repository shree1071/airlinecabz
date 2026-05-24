import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: "WhatsApp credentials not configured" },
        { status: 500 }
      );
    }

    // Format phone number (remove spaces and ensure it has country code)
    let formattedPhone = phoneNumber.replace(/\s/g, '').replace(/\D/g, '');
    
    // If it doesn't start with country code, assume India and add 91
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log(`Sending hello_world template to ${formattedPhone}`);
    console.log(`Using Phone Number ID: ${phoneNumberId}`);
    console.log(`Using Access Token: ${accessToken.substring(0, 20)}...`);

    // Use the hello_world template (pre-approved by Meta)
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US"
        }
      }
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      return NextResponse.json(
        { 
          error: "Failed to send WhatsApp message",
          details: result.error?.message || 'Unknown error',
          fullError: result
        },
        { status: 500 }
      );
    }

    console.log('WhatsApp message sent successfully:', result);

    return NextResponse.json({
      success: true,
      message: "Hello World template sent successfully!",
      result,
      sentTo: formattedPhone
    });
  } catch (error: any) {
    console.error("WhatsApp test error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send WhatsApp message",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
