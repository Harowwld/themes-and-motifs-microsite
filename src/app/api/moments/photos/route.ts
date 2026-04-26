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

    const formData = await request.formData();
    const momentId = formData.get("momentId") as string;
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;

    if (!momentId || !file) {
      return NextResponse.json({ error: "Moment ID and file are required" }, { status: 400 });
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

    // Skip compression in server environment - upload directly
    const compressedFile = file;

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${momentId}/${Date.now()}.${fileExt}`;
    const filePath = `moment-photos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("wedding-content")
      .upload(filePath, compressedFile, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("wedding-content")
      .getPublicUrl(filePath);

    // Get the next upload order
    const { data: existingPhotos } = await supabase
      .from("moment_photos")
      .select("upload_order")
      .eq("moment_id", momentId)
      .order("upload_order", { ascending: false })
      .limit(1);

    const nextOrder = existingPhotos && existingPhotos.length > 0 
      ? existingPhotos[0].upload_order + 1 
      : 0;

    // Save photo record
    const { data: photo, error: photoError } = await supabase
      .from("moment_photos")
      .insert({
        moment_id: momentId,
        image_url: publicUrl,
        caption: caption || null,
        upload_order: nextOrder,
      })
      .select()
      .single();

    if (photoError) {
      console.error("Error saving photo record:", photoError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("wedding-content").remove([filePath]);
      return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
