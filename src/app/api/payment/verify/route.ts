import { NextResponse } from "next/server";
import crypto from "crypto";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = body;

    // For local dev without keys
    if (process.env.RAZORPAY_KEY_SECRET === "REPLACE_ME") {
      // Just simulate success
      await updateBooking(booking_id, razorpay_order_id, razorpay_payment_id || "simulated_payment_id");
      return NextResponse.json({ success: true, message: "Simulated payment successful" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Verification logic
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      await updateBooking(booking_id, razorpay_order_id, razorpay_payment_id);
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

async function updateBooking(bookingId: string, orderId: string, paymentId: string) {
  const { error } = await insforge.database
    .from("bookings")
    .update({
      payment_status: "deposit_paid",
      status: "confirmed",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      updated_at: new Date().toISOString()
    })
    .eq("id", bookingId);

  if (error) {
    console.error("Failed to update booking status after payment:", error);
    throw new Error("Database update failed");
  }
}
