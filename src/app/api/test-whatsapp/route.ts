import { NextResponse } from "next/server";
import { sendSimpleWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    const result = await sendSimpleWhatsAppMessage(phoneNumber, message);

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent successfully",
      result
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