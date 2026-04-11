import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, booking_id } = body;

    // amount is in INR, Razorpay expects paise (amount * 100)
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${booking_id.substring(0, 8)}`,
      notes: {
        booking_id,
        user_id: userId,
      },
    };

    // Note: If you don't have valid Razorpay keys yet, this will fail.
    // For local dev without keys, you could return a dummy order id.
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_REPLACE_ME") {
       return NextResponse.json({
         order_id: `dummy_order_${Date.now()}`,
         amount: options.amount,
         currency: options.currency
       });
    }

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
