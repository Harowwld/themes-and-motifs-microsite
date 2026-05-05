import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("verification_documents")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ documents: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const id = Number(body?.id);

    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    for (const k of ["status", "notes", "reviewed_at"]) {
      if (k in (body ?? {})) patch[k] = (body as any)[k];
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: doc, error } = await supabase
      .from("verification_documents")
      .update(patch)
      .eq("id", id)
      .select("vendor_id,registration_id,doc_type")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (doc && patch.status === "approved") {
      const vendorId = doc.vendor_id;
      const regId = doc.registration_id;
      const docType = doc.doc_type?.trim().toLowerCase();

      if (vendorId) {
        const requiredDocs = ["dti", "sec", "permit"];
        const { data: allDocs } = await supabase
          .from("verification_documents")
          .select("doc_type,status")
          .eq("vendor_id", vendorId);

        if (allDocs) {
          const approvedDocs = new Set(
            allDocs
              .filter((d) => d.status === "approved" && d.doc_type?.trim().toLowerCase())
              .map((d) => d.doc_type!.trim().toLowerCase())
          );
          const allApproved = requiredDocs.every((d) => approvedDocs.has(d));
          await supabase
            .from("vendors")
            .update({ document_verified: allApproved })
            .eq("id", vendorId);
        }
      } else if (regId) {
        const { data: allDocs } = await supabase
          .from("verification_documents")
          .select("doc_type,status")
          .eq("registration_id", regId);

        if (allDocs) {
          const approvedDocs = new Set(
            allDocs
              .filter((d) => d.status === "approved" && d.doc_type?.trim().toLowerCase())
              .map((d) => d.doc_type!.trim().toLowerCase())
          );
          const allApproved = ["dti", "sec", "permit"].every((d) => approvedDocs.has(d));
          await supabase
            .from("vendor_registrations")
            .update({ document_verified: allApproved })
            .eq("id", regId);
        }
      }
    }

    const { data: updatedDoc } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("id", id)
      .single();

    return Response.json({ document: updatedDoc }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
