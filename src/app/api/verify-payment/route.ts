import { NextResponse } from "next/server";
import crypto from "crypto";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Verify the signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Update the booking status in InsForge
    const { data: booking, error: fetchError } = await insforge.database
      .from("bookings")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found for this order" }, { status: 404 });
    }

    const { error: updateError } = await insforge.database
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Failed to update booking status:", updateError);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
