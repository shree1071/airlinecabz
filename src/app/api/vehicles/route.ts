import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .select("*")
      .eq("is_active", true)
      .eq("vehicle_category", "airport")
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
