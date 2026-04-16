import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ClaimPayload = {
  vendorId: string;
  contactEmail: string;
  contactPhone?: string;
  businessName?: string;
  documents?: {
    dtiUrl?: string | null;
    secUrl?: string | null;
    businessPermitUrl?: string | null;
  };
};

export async function POST(req: Request) {
  let body: ClaimPayload;

  try {
    body = (await req.json()) as ClaimPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const vendorIdNum = Number(body.vendorId);
  const contactEmail = (body.contactEmail ?? "").trim();

  if (!Number.isFinite(vendorIdNum)) {
    return NextResponse.json({ error: "Valid vendor ID is required" }, { status: 400 });
  }

  if (!contactEmail) {
    return NextResponse.json({ error: "Contact email is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, user_id, business_name")
    .eq("id", vendorIdNum)
    .maybeSingle();

  if (vendorError) {
    return NextResponse.json({ error: vendorError.message }, { status: 500 });
  }

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  if (vendor.user_id) {
    return NextResponse.json({ error: "This vendor is already claimed" }, { status: 400 });
  }

  const { data: existingClaim } = await supabase
    .from("vendor_claims")
    .select("id, status")
    .eq("vendor_id", vendorIdNum)
    .eq("status", "pending")
    .maybeSingle();

  if (existingClaim) {
    return NextResponse.json({ error: "A pending claim already exists for this vendor" }, { status: 400 });
  }

  const documents = (body.documents ?? {}) as any;
  const cleanDocuments = Object.fromEntries(
    Object.entries({
      dtiUrl: documents.dtiUrl,
      secUrl: documents.secUrl,
      businessPermitUrl: documents.businessPermitUrl,
    }).filter(([_, v]) => v != null && v !== "")
  );

  const { data, error } = await supabase
    .from("vendor_claims")
    .insert({
      vendor_id: vendorIdNum,
      contact_email: contactEmail,
      contact_phone: (body.contactPhone ?? "").trim() || null,
      business_name: (body.businessName ?? "").trim() || null,
      status: "pending",
      documents: Object.keys(cleanDocuments).length > 0 ? cleanDocuments : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
