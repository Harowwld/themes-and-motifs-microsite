import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

function assertAdmin(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    throw new Error("Missing env var: ADMIN_TOKEN");
  }

  if (typeof token !== "string" || token.length === 0 || token !== expected) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("vendor_registrations")
      .select("id,business_name,contact_email,contact_phone,category_id,location,website_url,plan_id,status,created_at,extra")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ registrations: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

type PatchBody =
  | { id: number; action: "approve"; admin_notes?: string | null }
  | { id: number; action: "reject"; admin_notes?: string | null };

export async function PATCH(req: Request) {
  try {
    assertAdmin(req);

    const body = ((await req.json()) ?? {}) as PatchBody;

    if (typeof (body as any)?.id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    if ((body as any)?.action !== "approve" && (body as any)?.action !== "reject") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: reg, error: regErr } = await supabase
      .from("vendor_registrations")
      .select("id,business_name,contact_email,contact_phone,category_id,location,description,website_url,plan_id,status,extra")
      .eq("id", body.id)
      .single();

    if (regErr) {
      return Response.json({ error: regErr.message }, { status: 500 });
    }

    if (!reg) {
      return Response.json({ error: "Registration not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const adminNotes = typeof (body as any)?.admin_notes === "string" || (body as any)?.admin_notes === null ? (body as any).admin_notes : undefined;

    if (body.action === "reject") {
      const { data: updated, error: updErr } = await supabase
        .from("vendor_registrations")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          reviewed_at: now,
          reviewed_by: "admin",
        })
        .eq("id", body.id)
        .select("id,business_name,contact_email,contact_phone,category_id,location,website_url,plan_id,status,created_at")
        .single();

      if (updErr) {
        return Response.json({ error: updErr.message }, { status: 500 });
      }

      return Response.json({ registration: updated }, { status: 200 });
    }

    if (reg.status === "approved") {
      return Response.json({ error: "Already approved" }, { status: 409 });
    }

    const parsed = parseLocation(reg.location ?? "");
    const baseSlug = slugify(reg.business_name);
    const slug = await ensureUniqueSlug(supabase, baseSlug);

    const redirectTo = getRedirectTo();
    const invited = await inviteOrMagicLinkUser(supabase, reg.contact_email, redirectTo);

    const { data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .insert({
        user_id: invited.userId,
        business_name: reg.business_name,
        slug,
        description: reg.description ?? null,
        location_text: parsed.location_text,
        region_id: parsed.region_id,
        city: parsed.city,
        address: parsed.address,
        contact_email: reg.contact_email,
        contact_phone: reg.contact_phone ?? null,
        website_url: reg.website_url ?? null,
        plan_id: reg.plan_id ?? null,
        verified_status: "unverified",
        is_active: true,
        is_featured: false,
      })
      .select("id,slug")
      .single();

    if (vendorErr) {
      return Response.json({ error: vendorErr.message }, { status: 500 });
    }

    if (reg.category_id) {
      const { error: catErr } = await supabase.from("vendor_categories").insert({
        vendor_id: vendor.id,
        category_id: reg.category_id,
        is_primary: true,
      });
      if (catErr) {
        return Response.json({ error: catErr.message }, { status: 500 });
      }
    }

    const { data: updated, error: updErr } = await supabase
      .from("vendor_registrations")
      .update({
        status: "approved",
        admin_notes: adminNotes,
        reviewed_at: now,
        reviewed_by: "admin",
      })
      .eq("id", body.id)
      .select("id,business_name,contact_email,contact_phone,category_id,location,website_url,plan_id,status,created_at")
      .single();

    if (updErr) {
      return Response.json({ error: updErr.message }, { status: 500 });
    }

    return Response.json({ registration: updated, vendor, auth: invited }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

function getRedirectTo() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "").trim();
  if (!base) return undefined;
  const url = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${url}/vendor/signup`;
}

async function inviteOrMagicLinkUser(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
  redirectTo?: string
) {
  const e = (email ?? "").trim();
  if (!e) {
    throw new Error("Missing contact email");
  }

  const inviteRes = await supabase.auth.admin.inviteUserByEmail(e, {
    redirectTo,
  });

  if (!inviteRes.error && inviteRes.data?.user?.id) {
    return { userId: inviteRes.data.user.id, method: "invite" as const };
  }

  const message = inviteRes.error?.message ?? "";
  const looksLikeAlreadyExists = /already\s*(registered|exists)|user\s*already/i.test(message);

  if (!looksLikeAlreadyExists) {
    throw new Error(inviteRes.error?.message ?? "Failed to invite user");
  }

  const linkRes = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: e,
    options: { redirectTo },
  });

  if (linkRes.error || !linkRes.data?.user?.id) {
    throw new Error(linkRes.error?.message ?? "Failed to generate login link");
  }

  return { userId: linkRes.data.user.id, method: "magiclink" as const };
}

function slugify(input: string) {
  const s = (input ?? "").trim().toLowerCase();
  const cleaned = s
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "vendor";
}

async function ensureUniqueSlug(supabase: ReturnType<typeof createSupabaseAdminClient>, base: string) {
  let slug = base;
  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase.from("vendors").select("id").eq("slug", slug).limit(1);
    if (error) {
      throw new Error(error.message);
    }
    if (!data || data.length === 0) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

function parseLocation(raw: string) {
  const parts = (raw ?? "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  let region_id: number | null = null;
  const regionTokenIdx = parts.findIndex((p) => p.toLowerCase().startsWith("region_id:"));
  if (regionTokenIdx >= 0) {
    const v = parts[regionTokenIdx].split(":")[1];
    const n = Number(v);
    region_id = Number.isFinite(n) ? n : null;
    parts.splice(regionTokenIdx, 1);
  }

  const address = parts[0] ?? null;
  const city = parts[1] ?? null;
  const location_text = city ?? address;

  return { address, city, region_id, location_text };
}
