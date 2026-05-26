interface WhatsAppAlertData {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  total_amount: number | string;
}

export async function sendWhatsAppBookingAlert(booking: WhatsAppAlertData) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[WhatsApp] Tokens missing in .env.local, skipping alert.");
    return;
  }

  // Admin phone number to receive alerts (without '+' symbol)
  const adminPhone = "919901366449";

  const dt = new Date(booking.pickup_date);
  const dateStr = dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
  const timeStr = dt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const payload = {
    messaging_product: "whatsapp",
    to: adminPhone,
    type: "template",
    template: {
      name: "booking_confirm",
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: "SHREEHARSHA" },
            { type: "text", text: booking.id.slice(0, 8).toUpperCase() },
            { type: "text", text: booking.pickup_location.slice(0, 25) + "..." },
            { type: "text", text: booking.dropoff_location.slice(0, 25) + "..." },
            { type: "text", text: dateStr },
            { type: "text", text: timeStr },
            { type: "text", text: booking.vehicle_type || "N/A" },
            { type: "text", text: booking.total_amount?.toString() || "0" }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[WhatsApp] Error sending alert to Admin:", data);
    } else {
      console.log("[WhatsApp] Admin Alert sent successfully! Message ID:", data.messages?.[0]?.id);
    }
  } catch (err) {
    console.error("[WhatsApp] Network error while sending alert:", err);
  }
}