import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a lightweight query to keep the database active
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .select("id")
      .limit(1);

    if (error) {
      logger.logError("Error in keepalive cron job", error, "/api/cron/keepalive");
      return NextResponse.json({ error: "Failed to query database" }, { status: 500 });
    }

    console.log("[CRON] Database keepalive executed successfully at", new Date().toISOString());
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.logError("Unexpected error in GET /api/cron/keepalive", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
