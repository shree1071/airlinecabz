import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logSecurityViolation } from "@/lib/logger";
import { isValidUUID, sanitizeInput } from "@/lib/auth";
import { validateSession } from "@/lib/session-manager";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to get booking', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const validation = validateSession(token);
    if (!validation.valid) {
      logSecurityViolation('Invalid session token', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid booking ID format', req, { id });
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { data, error } = await insforge.database
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
      .eq("id", id)
      .single();

    if (error) {
      logger.logError("Error fetching booking", error, `/api/bookings/${id}`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const passenger = data.passengers?.[0] || {};
    const financial = data.financials?.[0] || {};
    const latestStatus = data.status_history?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0] || {};

    const flatBooking = {
      ...data,
      pickup_date: data.pickup_time || data.pickup_date,
      customer_name: passenger.name || '',
      customer_email: passenger.email || '',
      customer_phone: passenger.phone || '',
      pickup_location: data.pickup_address?.text_location || '',
      dropoff_location: data.dropoff_address?.text_location || '',
      address_line1: data.pickup_address?.address_line1 || '',
      address_line2: data.pickup_address?.address_line2 || '',
      landmark: data.pickup_address?.landmark || '',
      area: data.pickup_address?.area || '',
      pincode: data.pickup_address?.pincode || '',
      base_fare: financial.base_fare || 0,
      taxes: financial.taxes || 0,
      total_amount: financial.total_amount || 0,
      status: latestStatus.status || 'pending',
    };

    logger.logDataAccess('admin', 'bookings', 'read', ip);

    return NextResponse.json({ booking: flatBooking });
  } catch (err) {
    logger.logError("Unexpected error in GET /api/bookings/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to update booking', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const validation = validateSession(token);
    if (!validation.valid) {
      logSecurityViolation('Invalid session token', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid booking ID format', req, { id });
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await req.json();
    
    // Instead of updating a status column in bookings, we append to booking_status_history
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const sanitizedStatus = sanitizeInput(body.status);
      
      if (!validStatuses.includes(sanitizedStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      
      const { error: historyErr } = await insforge.database
        .from("booking_status_history")
        .insert([{
          booking_id: id,
          status: sanitizedStatus,
          notes: body.notes ? sanitizeInput(body.notes) : 'Status updated by admin'
        }]);

      if (historyErr) {
        logger.logError("Error updating booking status", historyErr, `/api/bookings/${id}`);
        return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
      }
    }

    // Update driver assignments if provided
    if (body.driver_name !== undefined || body.driver_phone !== undefined || body.vehicle_number !== undefined) {
      // Check if assignment exists
      const { data: existingAssignment } = await insforge.database
        .from("ride_assignments")
        .select("id")
        .eq("booking_id", id)
        .single();

      if (existingAssignment) {
        await insforge.database
          .from("ride_assignments")
          .update({
            driver_name: body.driver_name !== undefined ? sanitizeInput(body.driver_name) : undefined,
            driver_phone: body.driver_phone !== undefined ? sanitizeInput(body.driver_phone) : undefined,
            vehicle_number: body.vehicle_number !== undefined ? sanitizeInput(body.vehicle_number) : undefined,
            status: body.status === "in_progress" ? "in_progress" : (body.status === "completed" ? "completed" : "assigned")
          })
          .eq("booking_id", id);
      } else {
        await insforge.database
          .from("ride_assignments")
          .insert([{
            booking_id: id,
            driver_name: body.driver_name ? sanitizeInput(body.driver_name) : null,
            driver_phone: body.driver_phone ? sanitizeInput(body.driver_phone) : null,
            vehicle_number: body.vehicle_number ? sanitizeInput(body.vehicle_number) : null,
            status: body.status === "in_progress" ? "in_progress" : "assigned"
          }]);
      }
    }

    // Update financials if provided
    if (body.total_amount !== undefined) {
      const updateData: any = {
        total_amount: Number(body.total_amount)
      };
      if (body.payment_method !== undefined) {
        updateData.payment_method = sanitizeInput(body.payment_method);
      }
      await insforge.database
        .from("booking_financials")
        .update(updateData)
        .eq("booking_id", id);
    }

    // Fetch the updated booking to return
    const { data: updatedData, error: fetchErr } = await insforge.database
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
      .eq("id", id)
      .single();

    if (fetchErr || !updatedData) {
      return NextResponse.json({ error: "Booking not found after update" }, { status: 404 });
    }

    const passenger = updatedData.passengers?.[0] || {};
    const financial = updatedData.financials?.[0] || {};
    const latestStatus = updatedData.status_history?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0] || {};

    const flatBooking = {
      ...updatedData,
      pickup_date: updatedData.pickup_time || updatedData.pickup_date,
      customer_name: passenger.name || '',
      customer_email: passenger.email || '',
      customer_phone: passenger.phone || '',
      pickup_location: updatedData.pickup_address?.text_location || '',
      dropoff_location: updatedData.dropoff_address?.text_location || '',
      address_line1: updatedData.pickup_address?.address_line1 || '',
      address_line2: updatedData.pickup_address?.address_line2 || '',
      landmark: updatedData.pickup_address?.landmark || '',
      area: updatedData.pickup_address?.area || '',
      pincode: updatedData.pickup_address?.pincode || '',
      base_fare: financial.base_fare || 0,
      taxes: financial.taxes || 0,
      total_amount: financial.total_amount || 0,
      status: latestStatus.status || 'pending',
    };

    logger.logDataAccess('admin', 'bookings', 'update', ip);

    return NextResponse.json({ booking: flatBooking });
  } catch (err) {
    logger.logError("Unexpected error in PATCH /api/bookings/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
