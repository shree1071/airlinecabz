import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logRequest, logSecurityViolation } from "@/lib/logger";
import { sanitizeSQLInput } from "@/lib/auth";
import { validateSession } from "@/lib/session-manager";

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to bookings', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const validation = validateSession(token);
    if (!validation.valid) {
      logSecurityViolation('Invalid session token', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // SECURITY: Sanitize and validate status parameter to prevent SQL injection
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'all'];
    const sanitizedStatus = status ? sanitizeSQLInput(status) : null;
    
    if (sanitizedStatus && !validStatuses.includes(sanitizedStatus)) {
      logSecurityViolation('Invalid status parameter', req, { status });
      return NextResponse.json({ error: "Invalid status parameter" }, { status: 400 });
    }

    // 4NF Relational Query
    // We join all related tables to construct a complete booking object
    let query = insforge.database
      .from("bookings")
      .select(`
        *,
        pickup_address:pickup_address_id(*),
        dropoff_address:dropoff_address_id(*),
        passengers:booking_passengers(*),
        financials:booking_financials(*),
        status_history:booking_status_history(*),
        assignments:ride_assignments(*)
      `)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      logger.logError("Error fetching bookings", error, "/api/bookings");
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
    
    // Filter by status if provided (since status is now in status_history, we check the latest event)
    let filteredData = data;
    if (sanitizedStatus && sanitizedStatus !== "all") {
      filteredData = data.filter((booking: any) => {
        // Find latest status event
        const latestStatus = booking.status_history?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        return latestStatus?.status === sanitizedStatus;
      });
    }

    // Map 4NF nested structure to flat DTO for the frontend
    const mappedData = filteredData.map((b: any) => {
      const passenger = Array.isArray(b.passengers) ? (b.passengers[0] || {}) : (b.passengers || {});
      const financial = Array.isArray(b.financials) ? (b.financials[0] || {}) : (b.financials || {});
      const latestStatus = b.status_history?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || {};

      return {
        ...b,
        pickup_date: b.pickup_time || b.pickup_date,
        customer_name: passenger.name || '',
        customer_email: passenger.email || '',
        customer_phone: passenger.phone || '',
        pickup_location: b.pickup_address?.text_location || '',
        dropoff_location: b.dropoff_address?.text_location || '',
        address_line1: b.pickup_address?.address_line1 || '',
        address_line2: b.pickup_address?.address_line2 || '',
        landmark: b.pickup_address?.landmark || '',
        area: b.pickup_address?.area || '',
        pincode: b.pickup_address?.pincode || '',
        base_fare: financial.base_fare || 0,
        taxes: financial.taxes || 0,
        total_amount: financial.total_amount || 0,
        status: latestStatus.status || 'pending',
      };
    });

    logRequest(req, 200);
    logger.logDataAccess('admin', 'bookings', 'read', ip);
    
    return NextResponse.json({ bookings: mappedData });
  } catch (err) {
    logger.logError("Unexpected error in GET /api/bookings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const body = await req.json();

    const { validateBookingInput, sanitizeInput, isValidEmail, isValidPhone } = await import("@/lib/auth");

    const validation = validateBookingInput(body);
    if (!validation.valid) {
      console.error("[Bookings] Validation failed:", JSON.stringify(validation.errors));
      logSecurityViolation('Invalid booking input', req, { errors: validation.errors });
      return NextResponse.json({ error: "Invalid input", details: validation.errors }, { status: 400 });
    }

    const sanitizedData = {
      customer_name: sanitizeInput(body.customer_name),
      customer_email: sanitizeInput(body.customer_email),
      customer_phone: sanitizeInput(body.customer_phone),
      pickup_location: sanitizeInput(body.pickup_location),
      dropoff_location: sanitizeInput(body.dropoff_location),
      address_line1: body.address_line1 ? sanitizeInput(body.address_line1) : null,
      address_line2: body.address_line2 ? sanitizeInput(body.address_line2) : null,
      landmark: body.landmark ? sanitizeInput(body.landmark) : null,
      area: body.area ? sanitizeInput(body.area) : null,
      pincode: body.pincode ? sanitizeInput(body.pincode) : null,
      vehicle_type: sanitizeInput(body.vehicle_type),
      trip_type: body.trip_type || "to_airport",
      terminal: body.terminal || "terminal1",
    };

    if (!isValidEmail(sanitizedData.customer_email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!isValidPhone(sanitizedData.customer_phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    let formattedDate = "";
    try {
      const date = new Date(body.pickup_date);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      if (date < new Date()) {
        return NextResponse.json({ error: "Pickup date must be in the future" }, { status: 400 });
      }
      formattedDate = date.toISOString();
    } catch (dateErr) {
      return NextResponse.json({ error: "Invalid pickup date format" }, { status: 400 });
    }

    const baseFare = typeof body.base_fare === 'number' ? Math.max(0, Math.min(body.base_fare, 1000000)) : 0;
    const taxes = typeof body.taxes === 'number' ? Math.max(0, Math.min(body.taxes, 100000)) : 0;
    const totalAmount = typeof body.total_amount === 'number' ? Math.max(0, Math.min(body.total_amount, 1000000)) : 0;
    const distanceKm = typeof body.distance_km === 'number' ? Math.max(0, Math.min(body.distance_km, 10000)) : null;
    const durationMinutes = typeof body.duration_minutes === 'number' ? Math.max(0, Math.min(body.duration_minutes, 10000)) : null;

    // 1. Insert pickup address
    const { data: pickupData, error: pickupErr } = await insforge.database
      .from("addresses")
      .insert([{
        text_location: sanitizedData.pickup_location,
        address_line1: sanitizedData.address_line1,
        address_line2: sanitizedData.address_line2,
        landmark: sanitizedData.landmark,
        area: sanitizedData.area,
        pincode: sanitizedData.pincode,
      }])
      .select().single();
      
    if (pickupErr) throw new Error("Failed to create pickup address");

    // 2. Insert dropoff address
    const { data: dropoffData, error: dropoffErr } = await insforge.database
      .from("addresses")
      .insert([{
        text_location: sanitizedData.dropoff_location,
      }])
      .select().single();

    if (dropoffErr) throw new Error("Failed to create dropoff address");

    // 3. Insert core booking
    const { data: bookingData, error: bookingErr } = await insforge.database
      .from("bookings")
      .insert([{
        user_id: body.user_id ? sanitizeInput(body.user_id) : null,
        trip_type: sanitizedData.trip_type,
        terminal: sanitizedData.terminal,
        pickup_address_id: pickupData.id,
        dropoff_address_id: dropoffData.id,
        pickup_time: formattedDate,
        vehicle_type: sanitizedData.vehicle_type,
        distance_km: distanceKm,
        duration_minutes: durationMinutes,
      }])
      .select().single();

    if (bookingErr) throw new Error("Failed to create booking");
    
    const bookingId = bookingData.id;

    // 4. Insert passengers, financials, and initial status history event
    await Promise.all([
      insforge.database.from("booking_passengers").insert([{
        booking_id: bookingId,
        name: sanitizedData.customer_name,
        email: sanitizedData.customer_email,
        phone: sanitizedData.customer_phone
      }]),
      insforge.database.from("booking_financials").insert([{
        booking_id: bookingId,
        base_fare: baseFare,
        taxes: taxes,
        total_amount: totalAmount,
        payment_status: 'pending'
      }]),
      insforge.database.from("booking_status_history").insert([{
        booking_id: bookingId,
        status: 'pending',
        notes: 'Booking created'
      }])
    ]);

    // Fetch the fully constructed booking object to return
    const { data: finalBooking } = await insforge.database
      .from("bookings")
      .select(`
        *,
        pickup_address:pickup_address_id(*),
        dropoff_address:dropoff_address_id(*),
        passengers:booking_passengers(*),
        financials:booking_financials(*),
        status_history:booking_status_history(*)
      `)
      .eq('id', bookingId)
      .single();

    const passenger = Array.isArray(finalBooking.passengers) ? (finalBooking.passengers[0] || {}) : (finalBooking.passengers || {});
    const financial = Array.isArray(finalBooking.financials) ? (finalBooking.financials[0] || {}) : (finalBooking.financials || {});
    const latestStatus = finalBooking.status_history?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0] || {};

    const flatBooking = {
      ...finalBooking,
      pickup_date: finalBooking.pickup_time || finalBooking.pickup_date,
      customer_name: passenger.name || '',
      customer_email: passenger.email || '',
      customer_phone: passenger.phone || '',
      pickup_location: finalBooking.pickup_address?.text_location || '',
      dropoff_location: finalBooking.dropoff_address?.text_location || '',
      address_line1: finalBooking.pickup_address?.address_line1 || '',
      address_line2: finalBooking.pickup_address?.address_line2 || '',
      landmark: finalBooking.pickup_address?.landmark || '',
      area: finalBooking.pickup_address?.area || '',
      pincode: finalBooking.pickup_address?.pincode || '',
      base_fare: financial.base_fare || 0,
      taxes: financial.taxes || 0,
      total_amount: financial.total_amount || 0,
      status: latestStatus.status || 'pending',
    };

    logger.logDataAccess('customer', 'bookings', 'create', ip);
    logRequest(req, 200);

    // Notifications...
    // try {
    //   const { sendWhatsAppBookingAlert } = await import("@/lib/whatsapp");
    //   await sendWhatsAppBookingAlert({
    //     id: bookingId,
    //     pickup_location: sanitizedData.pickup_location,
    //     dropoff_location: sanitizedData.dropoff_location,
    //     pickup_date: formattedDate,
    //     vehicle_type: sanitizedData.vehicle_type,
    //     total_amount: totalAmount,
    //   });
    // } catch (waError) {}

    try {
      const { sendBookingNotificationEmail } = await import("@/lib/email");
      await sendBookingNotificationEmail(flatBooking);
    } catch (emailError) {}

    return NextResponse.json({ booking: flatBooking });
  } catch (err: any) {
    logger.logError("Unexpected error in POST /api/bookings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
