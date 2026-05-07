import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching vehicles:", error);
      return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }

    return NextResponse.json({ vehicles: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new vehicle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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
        name: body.name,
        slug: body.slug,
        base_fare: body.base_fare,
        per_km_rate: body.per_km_rate,
        image_url: body.image_url,
        is_ev: body.is_ev,
        is_active: body.is_active,
        capacity: body.capacity,
        vehicle_category: body.vehicle_category,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicle: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
