import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import { insforge } from "@/lib/insforge";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 1. Fetch the booking to get the amount (deposit_amount or total_amount)
    const { data: booking, error: fetchError } = await insforge.database
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("clerk_user_id", userId) // Ensure the user owns this booking
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Usually we charge a deposit amount, or the total amount
    const amountToCharge = booking.deposit_amount || booking.total_amount;

    // 2. Create the Razorpay Order
    const options = {
      amount: Math.round(amountToCharge * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_booking_${booking.id}`,
    };

    const order = await razorpay.orders.create(options);

    // 3. Update the booking with the razorpay_order_id
    const { error: updateError } = await insforge.database
      .from("bookings")
      .update({ razorpay_order_id: order.id })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to link order ID to booking:", updateError);
      return NextResponse.json({ error: "Failed to link order" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, amountToCharge });
  } catch (err) {
    console.error("Payment Creation Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
