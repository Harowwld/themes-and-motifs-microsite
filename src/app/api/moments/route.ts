import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow public access to view public moments
    const isPublicAccess = !user || !!authError;

    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get("visibility") || "all";
    const momentType = searchParams.get("type");

    let query = supabase
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
          vendors(business_name, slug)
        )
      `)
      .order("created_at", { ascending: false });

    // Filter by user ownership or public visibility
    if (isPublicAccess) {
      // Public users can only see public moments
      query = query.eq("visibility", "public");
    } else if (visibility === "all") {
      query = query.or(`user_id.eq.${user.id},visibility.eq.public`);
    } else if (visibility === "private") {
      query = query.eq("user_id", user.id);
    } else if (visibility === "public") {
      query = query.eq("visibility", "public");
    }

    // Filter by moment type if specified
    if (momentType) {
      query = query.eq("moment_type", momentType);
    }

    const { data: moments, error } = await query;

    if (error) {
      console.error("Error fetching moments:", error);
      return NextResponse.json({ error: "Failed to fetch moments" }, { status: 500 });
    }

    return NextResponse.json({ moments });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/moments - Starting request");
    
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    console.log("Token extracted:", token ? "Present" : "Missing");
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("Auth check:", { user: !!user, authError: authError?.message });

    if (authError || !user) {
      console.log("Unauthorized - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    const { title, content, moment_type, visibility = "private" } = body;

    if (!title || !moment_type) {
      return NextResponse.json({ error: "Title and moment type are required" }, { status: 400 });
    }

    if (!["photo", "review", "story", "milestone"].includes(moment_type)) {
      return NextResponse.json({ error: "Invalid moment type" }, { status: 400 });
    }

    if (!["private", "public", "friends"].includes(visibility)) {
      return NextResponse.json({ error: "Invalid visibility setting" }, { status: 400 });
    }

    console.log("Inserting moment into database:", {
      user_id: user.id,
      title,
      content,
      moment_type,
      visibility,
    });

    const { data: moment, error } = await supabase
      .from("wedding_moments")
      .insert({
        user_id: user.id,
        title,
        content,
        moment_type,
        visibility,
      })
      .select()
      .single();

    console.log("Insert result:", { moment, error: error?.message });

    if (error) {
      console.error("Error creating moment:", error);
      return NextResponse.json({ error: "Failed to create moment", details: error.message }, { status: 500 });
    }

    console.log("Moment created successfully:", moment);
    return NextResponse.json({ moment }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
