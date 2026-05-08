import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/errors";

// File upload security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Validate file MIME type
function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

// Validate file extension
function isValidExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and dangerous characters
  let sanitized = filename
    .replace(/[.]{2,}/g, ".") // Prevent multiple dots
    .replace(/[\\/<>:"|?*\x00-\x1f]/g, "") // Remove invalid chars
    .replace(/^\.+/, ""); // Remove leading dots
  
  // Limit filename length
  if (sanitized.length > 100) {
    const ext = sanitized.slice(sanitized.lastIndexOf("."));
    sanitized = sanitized.slice(0, 100 - ext.length) + ext;
  }
  
  return sanitized || "image";
}

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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 });
    }

    // Validate MIME type
    if (!isValidMimeType(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isValidExtension(file.name)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate MIME type matches extension (basic check)
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const expectedMimeTypes: Record<string, string[]> = {
      ".jpg": ["image/jpeg"],
      ".jpeg": ["image/jpeg"],
      ".png": ["image/png"],
      ".webp": ["image/webp"],
      ".gif": ["image/gif"],
    };
    
    const expected = expectedMimeTypes[ext];
    if (expected && !expected.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "File extension does not match its content type" },
        { status: 400 }
      );
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

    // Sanitize filename and construct safe file path
    const safeFileName = sanitizeFilename(file.name);
    const fileExt = safeFileName.slice(safeFileName.lastIndexOf(".") + 1);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const fileName = `${momentId}/${uniqueFileName}`;
    const filePath = `moments/${fileName}`;
    
    // Future: Add virus scanning here (e.g., ClamAV integration)
    // const scanResult = await scanFileForViruses(compressedFile);
    // if (!scanResult.clean) {
    //   return NextResponse.json({ error: "File failed security scan" }, { status: 400 });
    // }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-assets")
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
      .from("user-assets")
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
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("user-assets").remove([filePath]);
      return createErrorResponse(photoError, 500, { source: "save_photo_record", momentId });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error, 500, { source: "moments_photos_upload" });
  }
}
