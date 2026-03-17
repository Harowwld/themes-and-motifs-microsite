import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";

const TABLES = ["plans", "categories", "regions", "affiliations"] as const;

type TableName = (typeof TABLES)[number];

function isTableName(v: any): v is TableName {
  return TABLES.includes(v);
}

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") ?? "";

    if (!isTableName(table)) {
      return Response.json({ error: "Invalid table" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true }).limit(500);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ rows: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const table = body?.table;

    if (!isTableName(table)) {
      return Response.json({ error: "Invalid table" }, { status: 400 });
    }

    const data = body?.data;
    if (!data || typeof data !== "object") {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const allowedFieldsByTable: Record<TableName, string[]> = {
      plans: ["name", "price", "description", "features"],
      categories: ["name", "slug", "description", "icon", "display_order"],
      regions: ["name", "parent_id"],
      affiliations: ["name", "slug"],
    };

    const allowed = new Set(allowedFieldsByTable[table]);
    const insert: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (allowed.has(k)) insert[k] = v;
    }

    if (typeof insert.name !== "string" || !insert.name.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    insert.name = insert.name.trim();

    if (table === "categories" || table === "affiliations") {
      if (typeof insert.slug !== "string" || !insert.slug.trim()) {
        return Response.json({ error: "Slug is required" }, { status: 400 });
      }
      insert.slug = insert.slug.trim();
    }

    const { data: created, error } = await supabase.from(table).insert(insert).select("*").single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ row: created }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const table = body?.table;

    if (!isTableName(table)) {
      return Response.json({ error: "Invalid table" }, { status: 400 });
    }

    const id = body?.id;
    if (typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch = body?.patch;
    if (!patch || typeof patch !== "object") {
      return Response.json({ error: "Invalid patch" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("*").single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ row: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
