import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract token from Authorization header
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    
    const supabase = createSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      momentId,
      vendorId,
      overallRating,
      qualityRating,
      communicationRating,
      valueRating,
      reviewText,
      wouldRecommend,
    } = body;

    if (!momentId || !vendorId) {
      return NextResponse.json({ error: "Moment ID and Vendor ID are required" }, { status: 400 });
    }

    // Verify user owns the moment
    const { data: moment, error: momentError } = await supabase
      .from("wedding_moments")
      .select("id, user_id")
      .eq("id", momentId)
      .single();

    if (momentError || !moment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    if (moment.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, business_name")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Validate ratings
    const ratings = [overallRating, qualityRating, communicationRating, valueRating];
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "All ratings must be between 1 and 5" }, { status: 400 });
    }

    // Create the review
    const { data: review, error } = await supabase
      .from("vendor_reviews")
      .insert({
        moment_id: momentId,
        vendor_id: vendorId,
        overall_rating: overallRating,
        quality_rating: qualityRating,
        communication_rating: communicationRating,
        value_rating: valueRating,
        review_text: reviewText || null,
        would_recommend: wouldRecommend ?? true,
      })
      .select(`
        *,
        vendors(business_name, slug, logo_url)
      `)
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    // Update vendor's average rating and review count
    const { data: allReviews } = await supabase
      .from("vendor_reviews")
      .select("overall_rating")
      .eq("vendor_id", vendorId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / allReviews.length;
      
      await supabase
        .from("vendors")
        .update({
          average_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          review_count: allReviews.length,
        })
        .eq("id", vendorId);
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
