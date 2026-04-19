import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../lib/superadminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("bug_comments")
      .select("id,comment,name,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = ((await req.json().catch(() => null)) ?? {}) as { comment?: string };
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("bug_comments")
      .insert({ comment, name: null })
      .select("id,comment,name,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "ids parameter is required" }, { status: 400 });
    }

    const ids = idsParam.split(",").map((id) => Number(id)).filter((id) => Number.isFinite(id));

    if (ids.length === 0) {
      return NextResponse.json({ error: "No valid ids provided" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("bug_comments").delete().in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: ids.length }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
