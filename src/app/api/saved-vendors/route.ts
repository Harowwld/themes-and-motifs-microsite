import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

async function getUserFromRequest(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  if (!token) {
    return { data: null, error: { message: "Unauthorized" }, token: "" };
  }

  const supabase = createSupabaseAdminClient();
  const result = await supabase.auth.getUser(token);
  return { ...result, token };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    const user = authResult.data?.user ?? null;
    const authError = authResult.error;
    const token = authResult.token;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(token);

    const { data: savedVendors, error: fetchError } = await supabase
      .from("saved_vendors")
      .select(`
        created_at,
        vendor:vendors(
          id,
          business_name,
          slug,
          logo_url,
          cover_focus_x,
          cover_focus_y,
          cover_zoom,
          city,
          location_text,
          average_rating,
          review_count,
          starting_price,
          price_range,
          plan:plan_id(name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching saved vendors:", fetchError);
      return NextResponse.json({ error: "Failed to fetch saved vendors" }, { status: 500 });
    }

    return NextResponse.json({ savedVendors: savedVendors ?? [] });
  } catch (error) {
    console.error("Error in GET /api/saved-vendors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    const user = authResult.data?.user ?? null;
    const authError = authResult.error;
    const token = authResult.token;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(token);

    const body = await request.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const { data: vendor, error: vendorCheckError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .single();

    if (vendorCheckError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { data: savedVendor, error: saveError } = await supabase
      .from("saved_vendors")
      .upsert(
        {
          user_id: user.id,
          vendor_id: vendorId,
        },
        { onConflict: "user_id,vendor_id" }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Error saving vendor:", saveError);
      return NextResponse.json({ error: "Failed to save vendor" }, { status: 500 });
    }

    await supabase.rpc("increment_save_count", { vendor_id: vendorId });

    return NextResponse.json({ savedVendor, message: "Vendor saved successfully" });
  } catch (error) {
    console.error("Error in POST /api/saved-vendors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    const user = authResult.data?.user ?? null;
    const authError = authResult.error;
    const token = authResult.token;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(token);

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("saved_vendors")
      .delete()
      .eq("user_id", user.id)
      .eq("vendor_id", Number(vendorId));

    if (deleteError) {
      console.error("Error removing saved vendor:", deleteError);
      return NextResponse.json({ error: "Failed to remove saved vendor" }, { status: 500 });
    }

    await supabase.rpc("decrement_save_count", { vendor_id: Number(vendorId) });

    return NextResponse.json({ message: "Vendor removed from saved list" });
  } catch (error) {
    console.error("Error in DELETE /api/saved-vendors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    const user = authResult.data?.user ?? null;
    const authError = authResult.error;
    const token = authResult.token;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(token);

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const { data: savedVendor, error: checkError } = await supabase
      .from("saved_vendors")
      .select("vendor_id")
      .eq("user_id", user.id)
      .eq("vendor_id", Number(vendorId))
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking saved vendor:", checkError);
      return NextResponse.json({ error: "Failed to check saved status" }, { status: 500 });
    }

    return NextResponse.json({ isSaved: !!savedVendor });
  } catch (error) {
    console.error("Error in PATCH /api/saved-vendors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
