import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { insforge } from "@/lib/insforge";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = (sessionClaims?.metadata as any)?.role === "admin";
    
    // We only allow admins to patch bookings directly for now
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.payment_status) updateData.payment_status = body.payment_status;
    
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
