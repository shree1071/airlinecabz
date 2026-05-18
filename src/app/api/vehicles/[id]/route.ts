
import { NextResponse } from "next/server";

import { insforge } from "@/lib/insforge";

export async function PUT(

  request: Request,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;

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

      })
      .eq("id", id)
      .select()
      .single();

    if (error) {

      console.error("Error updating vehicle:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicle: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a vehicle
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await insforge.database

      .from("vehicle_types")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting vehicle:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("Unexpected error:", err);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  }

}
