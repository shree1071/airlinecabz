import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

/**
 * POST /api/sync-user
 * Called after Clerk sign-in/sign-up to upsert the user into InsForge.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clerkId, email, firstName, lastName, avatarUrl } = body;

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "clerkId and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existing } = await insforge.database
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (existing) {
      // Update existing user
      const { data, error } = await insforge.database
        .from("users")
        .update({
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", clerkId)
        .select();

      if (error) throw error;
      return NextResponse.json({ user: data, action: "updated" });
    }

    // Create new user
    const { data, error } = await insforge.database
      .from("users")
      .insert({
        clerk_id: clerkId,
        email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      })
      .select();

    if (error) throw error;
    return NextResponse.json({ user: data, action: "created" }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("sync-user error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
