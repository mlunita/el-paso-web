import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("mod_session");
  
  return NextResponse.redirect(new URL("/mod-login", request.url));
}
