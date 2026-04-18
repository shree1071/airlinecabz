import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await insforge.database
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    return NextResponse.json({ booking: data[0] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
