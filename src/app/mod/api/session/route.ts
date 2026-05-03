import { NextResponse } from "next/server";
import { getModSession } from "@/lib/mod-auth";

export async function GET() {
  const session = await getModSession();
  if (!session) {
    return NextResponse.json({ session: null });
  }
  
  // Do not leak internal token IDs to the client
  return NextResponse.json({
    session: {
      modName: session.modName,
      roleName: session.roleName,
      permissions: session.permissions,
    }
  });
}
