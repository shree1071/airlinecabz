export interface ProcessPaymentParams {
  bookingId: string;
  name?: string;
  email?: string;
  contact?: string;
  onSuccess?: (bookingId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Handles the Razorpay payment flow on the client side.
 * 1. Calls /api/create-payment to generate a Razorpay order linked to the booking.
 * 2. Opens the Razorpay modal.
 * 3. On success, calls /api/verify-payment to confirm the transaction.
 */
export async function processRazorpayPayment({
  bookingId,
  name = "AirlinCabz Ride",
  email,
  contact,
  onSuccess,
  onError,
}: ProcessPaymentParams) {
  try {
    // 1. Create order
    const createRes = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      throw new Error(createData.error || "Failed to create payment order");
    }

    const { orderId } = createData;

    // 2. Configure checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // Should be rzp_test_...
      amount: createData.amountToCharge * 100, // In paise
      currency: "INR",
      name: "AirlinCabz",
      description: "Advance Deposit for Premium Ride",
      image: "/next.svg", // Replace with app logo if needed
      order_id: orderId,
      handler: async function (response: any) {
        try {
          // 3. Verify payment signature
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            onSuccess?.(verifyData.bookingId);
          } else {
            throw new Error(verifyData.error || "Payment verification failed");
          }
        } catch (err: any) {
          onError?.(err.message || "Payment verification failed");
        }
      },
      prefill: {
        name,
        email,
        contact,
      },
      theme: {
        color: "#0f172a", // Match app dark theme
      },
    };

    // 4. Open Razorpay modal
    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      onError?.(response.error.description || "Payment failed");
    });
    rzp.open();
  } catch (err: any) {
    onError?.(err.message || "An unexpected error occurred during payment init");
  }
}
