import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../lib/editorAuth";
import { createErrorResponse } from "../../../../../lib/errors";

// Field validators for mass assignment protection
const FIELD_VALIDATORS: Record<string, (val: unknown) => { valid: boolean; value?: unknown; error?: string }> = {
  business_name: (val) => {
    if (typeof val !== "string") return { valid: false, error: "business_name must be a string" };
    if (val.length > 200) return { valid: false, error: "business_name must be under 200 characters" };
    return { valid: true, value: val.trim() };
  },
  slug: (val) => {
    if (typeof val !== "string") return { valid: false, error: "slug must be a string" };
    if (val.length > 100) return { valid: false, error: "slug must be under 100 characters" };
    if (!/^[a-z0-9-]+$/.test(val)) return { valid: false, error: "slug must be lowercase alphanumeric with hyphens only" };
    return { valid: true, value: val.trim() };
  },
  description: (val) => {
    if (typeof val !== "string") return { valid: false, error: "description must be a string" };
    if (val.length > 5000) return { valid: false, error: "description must be under 5000 characters" };
    return { valid: true, value: val.trim() };
  },
  location_text: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "location_text must be a string or null" };
    if (typeof val === "string" && val.length > 200) return { valid: false, error: "location_text must be under 200 characters" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  city: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "city must be a string or null" };
    if (typeof val === "string" && val.length > 100) return { valid: false, error: "city must be under 100 characters" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  address: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "address must be a string or null" };
    if (typeof val === "string" && val.length > 500) return { valid: false, error: "address must be under 500 characters" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_email: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "contact_email must be a string or null" };
    if (typeof val === "string" && val.length > 200) return { valid: false, error: "contact_email must be under 200 characters" };
    if (typeof val === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return { valid: false, error: "contact_email must be a valid email" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_phone: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "contact_phone must be a string or null" };
    if (typeof val === "string" && val.length > 50) return { valid: false, error: "contact_phone must be under 50 characters" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  website_url: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "website_url must be a string or null" };
    if (typeof val === "string" && val.length > 500) return { valid: false, error: "website_url must be under 500 characters" };
    if (typeof val === "string" && val.trim()) {
      let url = val.trim();
      // Auto-prepend https:// if no protocol provided
      if (!/^https?:\/\//.test(url)) url = `https://${url}`;
      if (!/^https?:\/\/.+/.test(url)) return { valid: false, error: "website_url must be a valid URL" };
      return { valid: true, value: url };
    }
    return { valid: true, value: val === null ? null : val.trim() };
  },
  logo_url: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "logo_url must be a string or null" };
    if (typeof val === "string" && val.length > 500) return { valid: false, error: "logo_url must be under 500 characters" };
    if (typeof val === "string" && !/^https?:\/\/.+/.test(val)) return { valid: false, error: "logo_url must be a valid URL" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_person_1_name: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_person_1_position: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_person_2_name: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  contact_person_2_position: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_email_1: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_email_2: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_email_3: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_phone_1: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_phone_2: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  admin_phone_3: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "Must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
  is_active: (val) => {
    if (typeof val !== "boolean") return { valid: false, error: "is_active must be a boolean" };
    return { valid: true, value: val };
  },
  is_featured: (val) => {
    if (typeof val !== "boolean") return { valid: false, error: "is_featured must be a boolean" };
    return { valid: true, value: val };
  },
  plan_id: (val) => {
    if (typeof val !== "number" && val !== null) return { valid: false, error: "plan_id must be a number or null" };
    return { valid: true, value: val };
  },

  year_established: (val) => {
    if (typeof val !== "string") return { valid: false, error: "year_established must be a string" };
    const yearStr = val.trim();
    if (!yearStr) return { valid: false, error: "Year established is required" };
    const yearNum = Number(yearStr);
    if (!Number.isInteger(yearNum) || yearNum < 1800 || yearNum > 2100) {
      return { valid: false, error: "year_established must be a valid year between 1800 and 2100" };
    }
    return { valid: true, value: `${yearNum}-01-01` };
  },

  document_verified: (val) => {
    // document_verified is required and may never be null
    if (typeof val !== "string" || val.trim() === "") {
      return { valid: false, error: "document_verified is required and must be a non-empty string" };
    }
    const parts = val.split(",").map(s => s.trim()).filter(Boolean);
    const ALLOWED = ["verified", "verification_in_progress", "community_recognized", "established_professional"];
    const invalid = parts.filter(p => !ALLOWED.includes(p));
    if (invalid.length > 0) {
      return { valid: false, error: "document_verified can only contain verified, verification_in_progress, community_recognized, and established_professional" };
    }
    // verification_in_progress cannot combine with verified or community_recognized,
    // but CAN coexist with established_professional (10-year automatic badge).
    const hasInProgress = parts.includes("verification_in_progress");
    if (hasInProgress && (parts.includes("verified") || parts.includes("community_recognized"))) {
      return { valid: false, error: "Cannot combine verification_in_progress with verified or community_recognized" };
    }
    return { valid: true, value: val };
  },
  tin: (val) => {
    if (typeof val !== "string" && val !== null) return { valid: false, error: "tin must be a string or null" };
    return { valid: true, value: val === null ? null : val.trim() };
  },
};

// Sanitize and validate patch object
function validatePatch(body: Record<string, unknown>): { patch: Record<string, unknown>; errors: string[] } {
  const patch: Record<string, unknown> = {};
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(FIELD_VALIDATORS)) {
    if (field in body) {
      const result = validator(body[field]);
      if (result.valid) {
        patch[field] = result.value;
      } else {
        errors.push(result.error || `Invalid value for ${field}`);
      }
    }
  }
  
  return { patch, errors };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const [vendorRes, imagesRes, videosRes, socialsRes, affiliationsRes, allAffiliationsRes, themesRes, allThemesRes, verificationDocsRes, subscriptionRes] = await Promise.all([
      supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .single(),
      supabase
        .from("vendor_images")
        .select("id, image_url, caption, is_cover, display_order")
        .eq("vendor_id", vendorId)
        .order("display_order", { ascending: true }),
      supabase
        .from("vendor_videos")
        .select("id, video_url, title, display_order")
        .eq("vendor_id", vendorId)
        .order("display_order", { ascending: true }),
      supabase
        .from("vendor_social_links")
        .select("id, platform, url")
        .eq("vendor_id", vendorId)
        .order("id", { ascending: true }),
      supabase
        .from("vendor_affiliations")
        .select("vendor_id, affiliation_id, affiliation:affiliations(id, name, slug)")
        .eq("vendor_id", vendorId),
      supabase
        .from("affiliations")
        .select("id, name, slug")
        .order("name", { ascending: true }),
      supabase
        .from("vendor_themes")
        .select("id, theme:themes(id, name, slug)")
        .eq("vendor_id", vendorId),
      supabase
        .from("themes")
        .select("id, name, slug")
        .order("name", { ascending: true }),
      supabase
        .from("verification_documents")
        .select("id, doc_type, file_url, file_name, status, uploaded_at, reviewed_at, notes")
        .eq("vendor_id", vendorId)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("vendor_subscriptions")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (vendorRes.error) {
      return createErrorResponse(vendorRes.error, 500, { source: "vendor_fetch", vendorId });
    }

    if (!vendorRes.data) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    return Response.json({
      vendor: vendorRes.data,
      images: imagesRes.data ?? [],
      videos: videosRes.data ?? [],
      socials: socialsRes.data ?? [],
      affiliations: affiliationsRes.data ?? [],
      allAffiliations: allAffiliationsRes.data ?? [],
      themes: themesRes.data ?? [],
      allThemes: allThemesRes.data ?? [],
      verificationDocuments: verificationDocsRes.data ?? [],
      subscription: subscriptionRes.data ?? null,
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return createErrorResponse(e, status, { source: "admin_vendor_get", vendorId: (await params).id });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};

    // Validate and sanitize patch data (mass assignment protection)
    const { patch, errors } = validatePatch(body);

    if (errors.length > 0) {
      return createErrorResponse(new Error(errors.join("; ")), 400, { validationErrors: errors });
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();



    const { data, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", vendorId)
      .select("*")
      .single();

    if (error) {
      return createErrorResponse(error, 500, { source: "vendor_update", vendorId });
    }

    return Response.json({ vendor: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return createErrorResponse(e, status, { source: "admin_vendor_patch", vendorId: (await params).id });
  }
}
