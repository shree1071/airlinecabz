import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logSecurityViolation } from "@/lib/logger";
import { isValidUUID, sanitizeInput } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to get booking', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // SECURITY: Validate UUID format to prevent injection
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid booking ID format', req, { id });
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { data, error } = await insforge.database
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.logError("Error fetching booking", error, `/api/bookings/${id}`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    logger.logDataAccess('admin', 'bookings', 'read', ip);

    return NextResponse.json({ booking: data });
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
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to update booking', req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // SECURITY: Validate UUID format to prevent injection
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid booking ID format', req, { id });
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await req.json();

    // SECURITY: Whitelist allowed fields and validate values
    const updateData: any = {};
    
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const sanitizedStatus = sanitizeInput(body.status);
      
      if (!validStatuses.includes(sanitizedStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      
      updateData.status = sanitizedStatus;
    }
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await insforge.database
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      logger.logError("Error updating booking", error, `/api/bookings/${id}`);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    logger.logDataAccess('admin', 'bookings', 'update', ip);

    return NextResponse.json({ booking: data[0] });
  } catch (err) {
    logger.logError("Unexpected error in PATCH /api/bookings/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
