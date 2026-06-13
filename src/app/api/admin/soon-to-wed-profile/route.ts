import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { assertSuperadminRequest } from "@/lib/superadminAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("soon_to_wed_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ profile: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 401;
    return Response.json({ error: e?.message ?? "Unauthorized" }, { status });
  }
}
