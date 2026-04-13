import { NextResponse } from "next/server";
import { getModSession } from "@/lib/mod-auth";

export async function GET() {
  const session = await getModSession();
  if (!session) {
    return NextResponse.json({ session: null });
  }
  return NextResponse.json({ session });
}
