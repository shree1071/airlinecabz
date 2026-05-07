import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = insforge.database
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({ bookings: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body.customer_name ||
      !body.customer_email ||
      !body.pickup_location ||
      !body.dropoff_location ||
      !body.pickup_date ||
      !body.vehicle_type ||
      !body.total_amount
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let formattedDate = "";
    try {
      formattedDate = new Date(body.pickup_date).toISOString();
    } catch (dateErr) {
      return NextResponse.json({ error: "Invalid pickup date format", details: String(dateErr) }, { status: 400 });
    }

    const newBooking = {
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      trip_type: body.trip_type || "to_airport",
      pickup_location: body.pickup_location,
      dropoff_location: body.dropoff_location,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      landmark: body.landmark || null,
      area: body.area || null,
      pincode: body.pincode || null,
      pickup_date: formattedDate,
      vehicle_type: body.vehicle_type,
      base_fare: body.base_fare || 0,
      taxes: body.taxes || 0,
      total_amount: body.total_amount,
      status: body.status || "pending",
      distance_km: body.distance_km || null,
      duration_minutes: body.duration_minutes || null,
    };

    const { data, error } = await insforge.database
      .from("bookings")
      .insert([newBooking])
      .select();

    if (error) {
      console.error("Error creating booking:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error("Payload was:", JSON.stringify(newBooking));
      return NextResponse.json({ error: "Failed to create booking", details: error }, { status: 500 });
    }

    return NextResponse.json({ booking: data[0] });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
