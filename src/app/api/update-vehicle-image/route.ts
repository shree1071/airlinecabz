import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { slug, image_url } = await request.json();

    const { data, error } = await insforge.database
      .from("vehicle_types")
      .update({ image_url })
      .eq("slug", slug)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
