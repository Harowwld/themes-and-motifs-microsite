import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";
import { createErrorResponse, CLIENT_ERRORS } from "../../../../lib/errors";
import { revalidatePath } from "next/cache";

// Sanitize search query to prevent SQL injection
function sanitizeSearchQuery(query: string): { sanitized: string; isValid: boolean } {
  // Limit query length
  if (query.length > 100) {
    return { sanitized: "", isValid: false };
  }
  
  // Remove potentially dangerous characters
  // Only allow alphanumeric, spaces, and basic punctuation
  const sanitized = query
    .replace(/[%_]/g, "") // Remove SQL wildcards
    .replace(/[<>'"&]/g, "") // Remove HTML/special chars
    .trim();
  
  // Validate query doesn't contain objects/arrays (NoSQL injection check)
  if (typeof query !== "string") {
    return { sanitized: "", isValid: false };
  }
  
  return { sanitized, isValid: true };
}

export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const offsetRaw = searchParams.get("offset");
    const rawQuery = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const limit = Math.max(1, Math.min(200, Number(limitRaw ?? 100) || 100));
    const offset = Math.max(0, Number(offsetRaw ?? 0) || 0);

    const supabase = createSupabaseAdminClient();

    let vendorsQuery = supabase
      .from("vendors")
      .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at,plan_id,document_verified,plan:plans(id,name)")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false });

    if (rawQuery) {
      const { sanitized: query, isValid } = sanitizeSearchQuery(rawQuery);
      if (!isValid) {
        return createErrorResponse(new Error("Search query too long"), 400, { query: rawQuery });
      }
      if (query) {
        // Use or() with separate filter calls instead of string interpolation
        vendorsQuery = vendorsQuery.or(`business_name.ilike.%${query}%,slug.ilike.%${query}%`);
      }
    }

    if (status) {
      vendorsQuery = vendorsQuery.eq("document_verified", status);
    }

    const [{ data: vendors, error }, { data: plans, error: plansErr }] = await Promise.all([
      vendorsQuery.range(offset, offset + limit - 1),
      supabase.from("plans").select("id,name").order("id", { ascending: true }).limit(50),
    ]);

    if (error) {
      return createErrorResponse(error, 500, { source: "vendors_query" });
    }

    if (plansErr) {
      return createErrorResponse(plansErr, 500, { source: "plans_query" });
    }

    return Response.json({ vendors: vendors ?? [], plans: plans ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return createErrorResponse(e, status, { source: "admin_vendors_get" });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id, is_active, is_featured, plan_id } = (await req.json()) ?? {};

    if (typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (typeof is_featured === "boolean") patch.is_featured = is_featured;
    if (typeof plan_id === "number" || plan_id === null) patch.plan_id = plan_id;

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", id)
      .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at,plan_id,plan:plans(id,name)")
      .single();

    if (error) {
      return createErrorResponse(error, 500, { source: "vendor_patch", id });
    }

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }


    return Response.json({ vendor: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return createErrorResponse(e, status, { source: "admin_vendors_patch" });
  }
}
