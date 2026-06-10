import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { attachCoverImages } from "@/features/vendors/coverImages.server";

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
          card_cover_focus_x,
          portrait_cover_focus_x,
          portrait_cover_focus_y,
          portrait_cover_zoom,
          card_cover_focus_y,
          card_cover_zoom,
          city,
          province:provinces(name),
          city_rel:cities(name),
          average_rating,
          review_count,
          starting_price,
          price_range,
          document_verified,
          plan:plans(name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching saved suppliers:", fetchError);
      return NextResponse.json({ error: "Failed to fetch saved suppliers" }, { status: 500 });
    }

    // Attach cover images dynamically using the helper function
    const rawVendors = (savedVendors ?? []).map((sv) => {
      const v = sv.vendor;
      return Array.isArray(v) ? v[0] : v;
    }).filter(Boolean);
    const vendorsWithCover = await attachCoverImages(supabase, rawVendors as any);

    const processedSavedVendors = (savedVendors ?? []).map((sv) => {
      const vendorObj: any = Array.isArray(sv.vendor) ? sv.vendor[0] : sv.vendor;
      const vendorId = vendorObj?.id;
      const vendorWithCover = vendorsWithCover.find((v) => v.id === vendorId);
      return {
        ...sv,
        vendor: vendorWithCover ?? vendorObj,
      };
    });

    return NextResponse.json({ savedVendors: processedSavedVendors });
  } catch (error) {
    console.error("Error in GET /api/saved-suppliers:", error);
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

    // Verify user is a Soon-to-Wed account, not a vendor or admin
    const { data: coupleProfile, error: profileCheckError } = await supabase
      .from("soon_to_wed_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileCheckError || !coupleProfile) {
      return NextResponse.json(
        { error: "Only Soon-to-Wed accounts can save suppliers to their shortlist." },
        { status: 403 }
      );
    }

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
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
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
      console.error("Error saving supplier:", saveError);
      return NextResponse.json({ error: "Failed to save supplier" }, { status: 500 });
    }

    await supabase.rpc("increment_save_count", { vendor_id: vendorId });

    return NextResponse.json({ savedVendor, message: "Supplier saved successfully" });
  } catch (error) {
    console.error("Error in POST /api/saved-suppliers:", error);
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
      console.error("Error removing saved supplier:", deleteError);
      return NextResponse.json({ error: "Failed to remove saved supplier" }, { status: 500 });
    }

    await supabase.rpc("decrement_save_count", { vendor_id: Number(vendorId) });

    return NextResponse.json({ message: "Supplier removed from saved list" });
  } catch (error) {
    console.error("Error in DELETE /api/saved-suppliers:", error);
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
      console.error("Error checking saved supplier:", checkError);
      return NextResponse.json({ error: "Failed to check saved status" }, { status: 500 });
    }

    return NextResponse.json({ isSaved: !!savedVendor });
  } catch (error) {
    console.error("Error in PATCH /api/saved-suppliers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
