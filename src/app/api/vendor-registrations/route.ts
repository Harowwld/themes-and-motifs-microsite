import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type RegistrationPayload = {
  businessName: string;
  contactEmail: string;
  contactPhone?: string;
  categoryId?: string;
  websiteUrl?: string;
  planId?: string;
  description?: string;
  location?: {
    regionId?: string;
    city?: string;
    address?: string;
  };
  extra?: unknown;
};

export async function POST(req: Request) {
  let body: RegistrationPayload;

  try {
    body = (await req.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const businessName = (body.businessName ?? "").trim();
  const contactEmail = (body.contactEmail ?? "").trim();

  if (!businessName) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  if (!contactEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const categoryIdNum = body.categoryId ? Number(body.categoryId) : null;
  const planIdNum = body.planId ? Number(body.planId) : null;

  const locationStr = [
    body.location?.address,
    body.location?.city,
    body.location?.regionId ? `region_id:${body.location.regionId}` : undefined,
  ]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" | ");

  const descriptionText = [
    (body.description ?? "").trim(),
    body.extra ? `\n\n---\nEXTRA_JSON:${JSON.stringify(body.extra)}` : "",
  ]
    .filter(Boolean)
    .join("");

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("vendor_registrations")
    .insert({
      business_name: businessName,
      contact_email: contactEmail,
      contact_phone: (body.contactPhone ?? "").trim() || null,
      category_id: Number.isFinite(categoryIdNum) ? categoryIdNum : null,
      location: locationStr || null,
      description: descriptionText || null,
      website_url: (body.websiteUrl ?? "").trim() || null,
      plan_id: Number.isFinite(planIdNum) ? planIdNum : null,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
