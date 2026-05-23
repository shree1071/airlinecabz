import { NextResponse } from "next/server";

// Webhook verification for WhatsApp Business API
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify token (you should set this in your environment variables)
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "your_verify_token_here";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified successfully");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Handle incoming WhatsApp messages/status updates
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Handle different types of webhook events
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const changes = body.entry[0].changes;
      
      for (const change of changes) {
        if (change.field === "messages") {
          // Handle message status updates
          if (change.value.statuses) {
            for (const status of change.value.statuses) {
              console.log(`Message ${status.id} status: ${status.status}`);
              // You can update your database here to track message delivery status
            }
          }
          
          // Handle incoming messages (if you want to respond to customer messages)
          if (change.value.messages) {
            for (const message of change.value.messages) {
              console.log(`Received message from ${message.from}: ${message.text?.body || 'Non-text message'}`);
              // You can implement auto-responses here if needed
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}