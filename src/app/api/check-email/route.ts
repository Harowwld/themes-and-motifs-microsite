import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

const supabaseAdmin = createSupabaseAdminClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("contact_email", normalizedEmail)
      .maybeSingle();

    if (vendor) {
      return NextResponse.json({ 
        error: "This email is already registered as a vendor. Please sign in as a vendor instead." 
      }, { status: 409 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (user) {
      return NextResponse.json({ 
        error: "An account with this email already exists. Please sign in or use forgot password to reset your account." 
      }, { status: 409 });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
