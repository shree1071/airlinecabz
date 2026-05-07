import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicle: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

// UPDATE vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .update({
        name: body.name,
        slug: body.slug,
        base_fare: body.base_fare,
        per_km_rate: body.per_km_rate,
        image_url: body.image_url,
        is_ev: body.is_ev,
        is_active: body.is_active,
        capacity: body.capacity,
        vehicle_category: body.vehicle_category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicle: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

// DELETE vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await insforge.database
      .from("vehicle_types")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
