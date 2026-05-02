import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsPayload } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const result = await recordAnalyticsPayload(request, payload);
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[Analytics] Failed to record payload:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
