import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && !path.startsWith("/")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Con sesión
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("user.id:", user.id);
    console.log("data:", data);
    console.log("error:", Error);
    console.log("path:", path);
    const role = data?.role;
    console.log("role:", role);
    if (path === "/") {
      if (role === "admin")
        return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "member")
        return NextResponse.redirect(new URL("/member", request.url));
      if (role === "client")
        return NextResponse.redirect(new URL("/client", request.url));
    }

    if (path.startsWith("/admin") && role !== "admin")
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    if (path.startsWith("/member") && role !== "member")
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    if (path.startsWith("/client") && role !== "client")
      return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};