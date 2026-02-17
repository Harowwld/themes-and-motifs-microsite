import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

function assertAdmin(req: NextApiRequest) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    throw new Error("Missing env var: ADMIN_TOKEN");
  }

  if (typeof token !== "string" || token.length === 0 || token !== expected) {
    const err = new Error("Unauthorized");
    (err as any).statusCode = 401;
    throw err;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    assertAdmin(req);

    const supabase = createSupabaseAdminClient();

    if (req.method === "GET") {
      const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
      const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

      const { data, error } = await supabase
        .from("vendors")
        .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at")
        .order("is_featured", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ vendors: data ?? [] });
    }

    if (req.method === "PATCH") {
      const { id, is_active, is_featured } = req.body ?? {};

      if (typeof id !== "number") {
        return res.status(400).json({ error: "Invalid id" });
      }

      const patch: Record<string, boolean> = {};
      if (typeof is_active === "boolean") patch.is_active = is_active;
      if (typeof is_featured === "boolean") patch.is_featured = is_featured;

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const { data, error } = await supabase
        .from("vendors")
        .update(patch)
        .eq("id", id)
        .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at")
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ vendor: data });
    }

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return res.status(status).json({ error: e?.message ?? "Unknown error" });
  }
}
