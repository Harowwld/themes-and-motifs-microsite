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
      .select("id, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (user) {
      // Provide specific error based on existing role
      if (user.role === "supplier") {
        return NextResponse.json({
          error: "This email is already registered as a vendor. Please sign in as a vendor instead.",
          existingRole: "supplier"
        }, { status: 409 });
      }
      if (user.role === "soon_to_wed") {
        return NextResponse.json({
          error: "This email is already registered as a couple. Please sign in instead.",
          existingRole: "soon_to_wed"
        }, { status: 409 });
      }
      if (user.role === "editor") {
        return NextResponse.json({
          error: "This email is already registered as an editor. Please sign in as an editor instead.",
          existingRole: "editor"
        }, { status: 409 });
      }
      return NextResponse.json({
        error: "An account with this email already exists. Please sign in.",
        existingRole: user.role
      }, { status: 409 });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
