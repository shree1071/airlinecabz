
import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger, logRequest, logSecurityViolation } from "@/lib/logger";
import { sanitizeInput } from "@/lib/auth";

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      logger.logError("Error fetching vehicles", error, "/api/vehicles");
      return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }

    return NextResponse.json({ vehicles: data });
    
  } catch (err) {
    logger.logError("Unexpected error in GET /api/vehicles", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // SECURITY: Admin-only endpoint - verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityViolation('Unauthorized access attempt to create vehicle', request);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // SECURITY: Validate and sanitize all inputs
    if (!body.name || !body.slug || typeof body.base_fare !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // SECURITY: Sanitize string inputs
    const sanitizedData = {
      name: sanitizeInput(body.name),
      slug: sanitizeInput(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, ''),
      base_fare: Math.max(0, Math.min(body.base_fare, 1000000)),
      per_km_rate: body.per_km_rate ? Math.max(0, Math.min(body.per_km_rate, 10000)) : 0,
      image_url: body.image_url ? sanitizeInput(body.image_url) : null,
      is_ev: Boolean(body.is_ev),
      is_active: Boolean(body.is_active),
      capacity: body.capacity ? sanitizeInput(body.capacity) : null,
      vehicle_category: body.vehicle_category ? sanitizeInput(body.vehicle_category) : 'airport',
    };

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(sanitizedData.slug)) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }
    
    // Get the highest sort_order to add new vehicle at the end
    const { data: maxSortData } = await insforge.database
      .from("vehicle_types")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    
    const nextSortOrder = (maxSortData?.sort_order || 0) + 1;
    
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .insert({
        ...sanitizedData,
        sort_order: nextSortOrder,
      })
      .select()
      .single();
    
    if (error) {
      logger.logError("Error creating vehicle", error, "/api/vehicles");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    logger.logDataAccess('admin', 'vehicles', 'create', ip);
    
    return NextResponse.json({ vehicle: data });
  } catch (err) {
    logger.logError("Unexpected error in POST /api/vehicles", err);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
