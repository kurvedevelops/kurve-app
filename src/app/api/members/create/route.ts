import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const supabaseAdmin = createServiceClient();
  const body = await request.json();
  const { full_name, email, password } = body;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json(
      { success: false, error: authError.message },
      { status: 400 },
    );
  }

  const { error: dbError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email,
    full_name,
    role: "member",
    active: true,
  });

  if (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
