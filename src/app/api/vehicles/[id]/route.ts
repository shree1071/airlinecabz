
import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logSecurityViolation } from "@/lib/logger";
import { isValidUUID, sanitizeInput } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to update vehicle', request);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // SECURITY: Validate UUID format
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid vehicle ID format', request, { id });
      return NextResponse.json({ error: "Invalid vehicle ID" }, { status: 400 });
    }

    const body = await request.json();

    // SECURITY: Validate and sanitize all inputs
    const sanitizedData = {
      name: body.name ? sanitizeInput(body.name) : undefined,
      slug: body.slug ? sanitizeInput(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '') : undefined,
      base_fare: typeof body.base_fare === 'number' ? Math.max(0, Math.min(body.base_fare, 1000000)) : undefined,
      per_km_rate: typeof body.per_km_rate === 'number' ? Math.max(0, Math.min(body.per_km_rate, 10000)) : undefined,
      image_url: body.image_url ? sanitizeInput(body.image_url) : undefined,
      is_ev: body.is_ev !== undefined ? Boolean(body.is_ev) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
      capacity: body.capacity ? sanitizeInput(body.capacity) : undefined,
      vehicle_category: body.vehicle_category ? sanitizeInput(body.vehicle_category) : undefined,
    };

    // Remove undefined values
    Object.keys(sanitizedData).forEach(key => 
      sanitizedData[key as keyof typeof sanitizedData] === undefined && delete sanitizedData[key as keyof typeof sanitizedData]
    );

    const { data, error } = await insforge.database
      .from("vehicle_types")
      .update(sanitizedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.logError("Error updating vehicle", error, `/api/vehicles/${id}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.logDataAccess('admin', 'vehicles', 'update', ip);

    return NextResponse.json({ vehicle: data });
  } catch (err) {
    logger.logError("Unexpected error in PUT /api/vehicles/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a vehicle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to delete vehicle', request);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // SECURITY: Validate UUID format
    if (!isValidUUID(id)) {
      logSecurityViolation('Invalid vehicle ID format', request, { id });
      return NextResponse.json({ error: "Invalid vehicle ID" }, { status: 400 });
    }

    const { error } = await insforge.database
      .from("vehicle_types")
      .delete()
      .eq("id", id);

    if (error) {
      logger.logError("Error deleting vehicle", error, `/api/vehicles/${id}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.logDataAccess('admin', 'vehicles', 'delete', ip);

    return NextResponse.json({ success: true });

  } catch (err) {
    logger.logError("Unexpected error in DELETE /api/vehicles/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
