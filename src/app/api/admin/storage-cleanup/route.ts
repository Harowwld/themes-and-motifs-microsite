import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const supabase = createSupabaseAdminClient();

    // 1. Fetch the schedule configuration from system_settings
    const { data: configData, error: configError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "storage_cleanup_schedule")
      .maybeSingle();

    const schedule = configData?.value ?? {
      enabled: false,
      cron: "0 2 * * *",
      limit: 1000,
      dry_run: false,
    };

    // 2. Fetch all orphan images from the RPC helper
    const { data: orphanObjects, error: rpcError } = await supabase
      .rpc("get_orphan_images", { p_bucket_id: "vendor-assets" });

    if (rpcError) {
      return Response.json({ error: `Database RPC failed: ${rpcError.message}` }, { status: 500 });
    }

    const orphans = (orphanObjects ?? []).map((obj: any) => {
      const name = typeof obj === "string" ? obj : obj.object_name;
      // Get the public URL for previews
      const { data: { publicUrl } } = supabase.storage
        .from("vendor-assets")
        .getPublicUrl(name);
      return {
        name,
        url: publicUrl,
      };
    });

    return Response.json({ schedule, orphans }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { action } = body;
    const supabase = createSupabaseAdminClient();

    if (action === "update_schedule") {
      const { schedule } = body;
      if (!schedule || typeof schedule !== "object") {
        return Response.json({ error: "Invalid schedule config" }, { status: 400 });
      }

      // Fetch existing config first to preserve background execution metrics (last_run)
      const { data: configData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "storage_cleanup_schedule")
        .maybeSingle();

      const existingValue = configData?.value ?? {};

      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "storage_cleanup_schedule",
          value: {
            ...existingValue,
            enabled: !!schedule.enabled,
            cron: String(schedule.cron || "0 2 * * *"),
            limit: Number(schedule.limit ?? 1000),
            dry_run: !!schedule.dry_run,
          },
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ success: true }, { status: 200 });
    }

    if (action === "delete_orphans") {
      const { files } = body;
      if (!Array.isArray(files) || files.length === 0) {
        return Response.json({ error: "No files specified for deletion" }, { status: 400 });
      }

      // Delete the files from the storage bucket using admin client (service role)
      const { data, error } = await supabase.storage
        .from("vendor-assets")
        .remove(files);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ success: true, deleted_count: files.length }, { status: 200 });
    }

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }


    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
