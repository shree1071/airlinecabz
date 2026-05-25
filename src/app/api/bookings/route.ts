import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logRequest, logSecurityViolation } from "@/lib/logger";
import { sanitizeSQLInput } from "@/lib/auth";

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to bookings', req);
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

    let query = insforge.database
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (sanitizedStatus && sanitizedStatus !== "all") {
      query = query.eq("status", sanitizedStatus);
    }

    const { data, error } = await query;

    if (error) {
      logger.logError("Error fetching bookings", error, "/api/bookings");
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    logRequest(req, 200);
    logger.logDataAccess('admin', 'bookings', 'read', ip);
    
    return NextResponse.json({ bookings: data });
  } catch (err) {
    logger.logError("Unexpected error in GET /api/bookings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const body = await req.json();

    // SECURITY: Import validation functions
    const { validateBookingInput, sanitizeInput, isValidEmail, isValidPhone } = await import("@/lib/auth");

    // SECURITY: Comprehensive input validation
    const validation = validateBookingInput(body);
    if (!validation.valid) {
      logSecurityViolation('Invalid booking input', req, { errors: validation.errors });
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validation.errors 
      }, { status: 400 });
    }

    // SECURITY: Sanitize all string inputs to prevent XSS
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

    // SECURITY: Additional email and phone validation
    if (!isValidEmail(sanitizedData.customer_email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!isValidPhone(sanitizedData.customer_phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // SECURITY: Validate and sanitize date
    let formattedDate = "";
    try {
      const date = new Date(body.pickup_date);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      // SECURITY: Ensure date is not in the past
      if (date < new Date()) {
        return NextResponse.json({ error: "Pickup date must be in the future" }, { status: 400 });
      }
      formattedDate = date.toISOString();
    } catch (dateErr) {
      return NextResponse.json({ error: "Invalid pickup date format" }, { status: 400 });
    }

    // SECURITY: Validate numeric inputs
    const baseFare = typeof body.base_fare === 'number' ? Math.max(0, Math.min(body.base_fare, 1000000)) : 0;
    const taxes = typeof body.taxes === 'number' ? Math.max(0, Math.min(body.taxes, 100000)) : 0;
    const totalAmount = typeof body.total_amount === 'number' ? Math.max(0, Math.min(body.total_amount, 1000000)) : 0;
    const distanceKm = typeof body.distance_km === 'number' ? Math.max(0, Math.min(body.distance_km, 10000)) : null;
    const durationMinutes = typeof body.duration_minutes === 'number' ? Math.max(0, Math.min(body.duration_minutes, 10000)) : null;

    const newBooking = {
      ...sanitizedData,
      pickup_date: formattedDate,
      base_fare: baseFare,
      taxes: taxes,
      total_amount: totalAmount,
      status: "pending", // SECURITY: Always set to pending, don't trust client
      distance_km: distanceKm,
      duration_minutes: durationMinutes,
    };

    const { data, error } = await insforge.database
      .from("bookings")
      .insert([newBooking])
      .select();

    if (error) {
      logger.logError("Error creating booking", error, "/api/bookings");
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    const booking = data[0];

    // Log successful booking creation
    logger.logDataAccess('customer', 'bookings', 'create', ip);
    logRequest(req, 200);

    // Try sending WhatsApp alert to admin (non-blocking)
    try {
      const { sendWhatsAppBookingAlert } = await import("@/lib/whatsapp");
      await sendWhatsAppBookingAlert({
        id: booking.id,
        pickup_location: booking.pickup_location,
        dropoff_location: booking.dropoff_location,
        pickup_date: booking.pickup_date,
        vehicle_type: booking.vehicle_type,
        total_amount: booking.total_amount,
      });
    } catch (waError) {
      logger.logError("Failed to send WhatsApp admin alert", waError);
      // Don't fail the booking if notification fails
    }

    // Try sending email notification to admin (non-blocking)
    try {
      const { sendBookingNotificationEmail } = await import("@/lib/email");
      await sendBookingNotificationEmail(booking);
    } catch (emailError) {
      logger.logError("Failed to send booking email notification", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ booking });
  } catch (err: any) {
    logger.logError("Unexpected error in POST /api/bookings", err);
    // SECURITY: Don't expose internal error details to client
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
