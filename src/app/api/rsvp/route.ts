import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && !uuidRegex.test(userId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }
    if (guestId && !uuidRegex.test(guestId)) {
      return NextResponse.json({ error: "Invalid guestId format" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // If checkEmpty is requested, return total guest count for a given user
    const checkEmpty = searchParams.get("checkEmpty") === "true";
    if (userId && checkEmpty) {
      const { count, error: countError } = await supabase
        .from("wedding_guests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Error checking empty guestlist:", countError);
        return NextResponse.json({ error: "Failed to check guest list status" }, { status: 500 });
      }

      return NextResponse.json({ totalGuests: count || 0 });
    }

    // If userId and name are provided, perform a guest search
    if (userId && name) {
      const { data: guests, error: searchError } = await supabase
        .from("wedding_guests")
        .select(`
          id, 
          name, 
          rsvp_status, 
          dietary, 
          table_id,
          wedding_tables (
            name
          )
        `)
        .eq("user_id", userId)
        .ilike("name", `%${name}%`)
        .limit(10);

      if (searchError) {
        console.error("Error searching wedding guests:", searchError);
        return NextResponse.json({ error: "Failed to search guests" }, { status: 500 });
      }

      return NextResponse.json({ guests: guests || [] });
    }

    if (!guestId) {
      return NextResponse.json({ error: "Missing guestId parameter" }, { status: 400 });
    }

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

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (guestId && !uuidRegex.test(guestId)) {
      return NextResponse.json({ error: "Invalid guestId format" }, { status: 400 });
    }

    if (email && email.length > 255) {
      return NextResponse.json({ error: "Email parameter too long" }, { status: 400 });
    }
    if (phone && phone.length > 50) {
      return NextResponse.json({ error: "Phone parameter too long" }, { status: 400 });
    }
    if (dietary && dietary.length > 1000) {
      return NextResponse.json({ error: "Dietary restrictions parameter too long" }, { status: 400 });
    }

    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
    }

    const supabase = createSupabaseAdminClient();

    // Update guest record securely using Supabase admin/service role client
    const updatePayload: any = {
      rsvp_status: rsvpStatus
    };
    if (email !== undefined) updatePayload.email = email ?? "";
    if (phone !== undefined) updatePayload.phone = phone ?? "";
    if (dietary !== undefined) updatePayload.dietary = dietary ?? "";

    const { data: updatedGuest, error: updateError } = await supabase
      .from("wedding_guests")
      .update(updatePayload)
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
