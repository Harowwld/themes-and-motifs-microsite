import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ momentId: string }> }
) {
  try {
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow public access to view public moments
    const isPublicAccess = !user || !!authError;

    const { momentId } = await params;

    const { data: moment, error } = await supabase
      .from("wedding_moments")
      .select(`
        *,
        moment_photos(id, image_url, caption, upload_order),
        vendor_reviews(
          id, 
          vendor_id, 
          overall_rating, 
          quality_rating, 
          communication_rating, 
          value_rating, 
          review_text, 
          would_recommend,
          vendors(business_name, slug, logo_url)
        )
      `)
      .eq("id", momentId)
      .single();

    if (error) {
      console.error("Error fetching moment:", error);
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    // Check if user can view this moment
    if (!isPublicAccess && moment.user_id !== user.id && moment.visibility !== "public") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Public users can only view public moments
    if (isPublicAccess && moment.visibility !== "public") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ moment });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ momentId: string }> }
) {
  try {
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { momentId } = await params;
    const body = await request.json();
    const { title, content, visibility } = body;

    // First check if user owns this moment
    const { data: existingMoment, error: fetchError } = await supabase
      .from("wedding_moments")
      .select("id, user_id")
      .eq("id", momentId)
      .single();

    if (fetchError || !existingMoment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    if (existingMoment.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (visibility !== undefined) {
      if (!["private", "public", "friends"].includes(visibility)) {
        return NextResponse.json({ error: "Invalid visibility setting" }, { status: 400 });
      }
      updateData.visibility = visibility;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: moment, error } = await supabase
      .from("wedding_moments")
      .update(updateData)
      .eq("id", momentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating moment:", error);
      return NextResponse.json({ error: "Failed to update moment" }, { status: 500 });
    }

    return NextResponse.json({ moment });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ momentId: string }> }
) {
  try {
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { momentId } = await params;

    // First check if user owns this moment
    const { data: existingMoment, error: fetchError } = await supabase
      .from("wedding_moments")
      .select("id, user_id")
      .eq("id", momentId)
      .single();

    if (fetchError || !existingMoment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    if (existingMoment.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("wedding_moments")
      .delete()
      .eq("id", momentId);

    if (error) {
      console.error("Error deleting moment:", error);
      return NextResponse.json({ error: "Failed to delete moment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
