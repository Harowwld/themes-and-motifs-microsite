import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

export async function assertVendor(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  if (!token) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }

  return { supabase, user: data.user };
}

export async function getVendorForUser(supabase: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id,user_id,business_name,slug,logo_url,description,location_text,region_id,city,address,contact_email,contact_phone,website_url,plan_id,is_active,verified_status,plan:plans(id,name)"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const err = new Error("Vendor not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  return data as any;
}
