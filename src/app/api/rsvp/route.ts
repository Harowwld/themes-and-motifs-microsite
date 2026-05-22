import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json({ error: "Missing guestId parameter" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Fetch guest by secure UUID
    const { data: guest, error: guestError } = await supabase
      .from("wedding_guests")
      .select("*")
      .eq("id", guestId)
      .maybeSingle();

    if (guestError) {
      console.error("Error fetching guest RSVP details:", guestError);
      return NextResponse.json({ error: "Failed to fetch guest details" }, { status: 500 });
    }

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // 2. Fetch table name if guest has table assigned
    let tableName: string | null = null;
    if (guest.table_id) {
      const { data: table, error: tableError } = await supabase
        .from("wedding_tables")
        .select("name")
        .eq("id", guest.table_id)
        .maybeSingle();

      if (!tableError && table) {
        tableName = table.name;
      }
    }

    // 3. Return mapped keys for smooth frontend consumption
    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        category: guest.category,
        email: guest.email,
        phone: guest.phone,
        dietary: guest.dietary ?? "",
        rsvpStatus: guest.rsvp_status,
        tableId: guest.table_id,
        tableName
      }
    });

  } catch (error) {
    console.error("Internal Server Error in GET /api/rsvp:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, rsvpStatus, email, phone, dietary } = body;

    if (!guestId || !rsvpStatus) {
      return NextResponse.json({ error: "Missing guestId or rsvpStatus in request" }, { status: 400 });
    }

    const validStatuses = ["pending", "attending", "declined"];
    if (!validStatuses.includes(rsvpStatus)) {
      return NextResponse.json({ error: "Invalid rsvpStatus value" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Update guest record securely using Supabase admin/service role client
    const { data: updatedGuest, error: updateError } = await supabase
      .from("wedding_guests")
      .update({
        rsvp_status: rsvpStatus,
        email: email ?? "",
        phone: phone ?? "",
        dietary: dietary ?? ""
      })
      .eq("id", guestId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating guest RSVP record:", updateError);
      return NextResponse.json({ error: "Failed to submit RSVP update" }, { status: 500 });
    }

    if (!updatedGuest) {
      return NextResponse.json({ error: "Guest not found or could not be updated" }, { status: 404 });
    }

    // Fetch table name if assigned
    let tableName: string | null = null;
    if (updatedGuest.table_id) {
      const { data: table } = await supabase
        .from("wedding_tables")
        .select("name")
        .eq("id", updatedGuest.table_id)
        .maybeSingle();

      if (table) {
        tableName = table.name;
      }
    }

    return NextResponse.json({
      message: "RSVP updated successfully",
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        category: updatedGuest.category,
        email: updatedGuest.email,
        phone: updatedGuest.phone,
        dietary: updatedGuest.dietary ?? "",
        rsvpStatus: updatedGuest.rsvp_status,
        tableId: updatedGuest.table_id,
        tableName
      }
    });

  } catch (error) {
    console.error("Internal Server Error in POST /api/rsvp:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
