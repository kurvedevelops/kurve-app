import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(/* ... */);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  // Sin sesión: redirigir a login
  if (!user && !path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Con sesión: verificar rol vs ruta
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = data?.role;
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (path.startsWith("/member") && role !== "member") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (path.startsWith("/client") && role !== "client") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
