import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type SocialLink = { platform: string; url: string };

type PutBody = {
  socials: SocialLink[];
};

export async function PUT(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const planName = String((vendor as any)?.plan?.name ?? "").trim().toLowerCase();
    const isPremium = planName.includes("premium");
    if (!isPremium) {
      return Response.json({ error: "Social links are available on Premium plans only." }, { status: 403 });
    }

    const body = ((await req.json()) ?? {}) as PutBody;
    const socials = Array.isArray(body.socials) ? body.socials : [];

    const cleaned = socials
      .map((s) => ({ platform: String(s.platform ?? "").trim(), url: String(s.url ?? "").trim() }))
      .filter((s) => s.platform && s.url);

    const { error: delErr } = await supabase.from("vendor_social_links").delete().eq("vendor_id", vendor.id);
    if (delErr) return Response.json({ error: delErr.message }, { status: 500 });

    if (cleaned.length > 0) {
      const { error: insErr } = await supabase
        .from("vendor_social_links")
        .insert(cleaned.map((s) => ({ vendor_id: vendor.id, platform: s.platform, url: s.url })));

      if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("vendor_social_links")
      .select("id,platform,url")
      .eq("vendor_id", vendor.id)
      .order("platform", { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ socials: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
