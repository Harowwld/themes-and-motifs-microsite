import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";

function slugify(input: string) {
  const s = (input ?? "").trim().toLowerCase();
  const cleaned = s
    .replace(/['']g/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "affiliation";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};
    const affiliations = body.affiliations ?? [];

    if (!Array.isArray(affiliations)) {
      return Response.json({ error: "Invalid affiliations array" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Get existing affiliations to check for new ones
    const { data: existingAffiliations } = await supabase
      .from("affiliations")
      .select("id, name, slug")
      .order("name", { ascending: true });

    const existingByName = new Map((existingAffiliations ?? []).map((a) => [a.name.toLowerCase(), a]));
    const existingBySlug = new Map((existingAffiliations ?? []).map((a) => [a.slug, a]));

    // Process affiliations - create new ones if needed
    const affiliationIds: number[] = [];
    const createdAffiliations: { id: number; name: string; slug: string }[] = [];

    for (const aff of affiliations) {
      const name = (aff.name ?? "").trim();
      if (!name) continue;

      const nameLower = name.toLowerCase();
      let affiliationId: number | null = null;

      // Check if affiliation already exists by name
      const existingByNameMatch = existingByName.get(nameLower);
      if (existingByNameMatch) {
        affiliationId = existingByNameMatch.id;
      } else {
        // Create new affiliation
        const slug = slugify(name);
        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (existingBySlug.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }

        const { data: newAff, error: createError } = await supabase
          .from("affiliations")
          .insert({ name, slug: uniqueSlug })
          .select("id, name, slug")
          .single();

        if (createError) {
          return Response.json({ error: createError.message }, { status: 500 });
        }

        if (newAff) {
          affiliationId = newAff.id;
          createdAffiliations.push(newAff);
          // Add to maps for subsequent iterations
          existingByName.set(nameLower, newAff);
          existingBySlug.set(uniqueSlug, newAff);
        }
      }

      if (affiliationId) {
        affiliationIds.push(affiliationId);
      }
    }

    // Delete existing vendor affiliations
    await supabase.from("vendor_affiliations").delete().eq("vendor_id", vendorId);

    // Insert new vendor affiliations
    if (affiliationIds.length > 0) {
      const vendorAffiliationsToInsert = affiliationIds.map((affId) => ({
        vendor_id: vendorId,
        affiliation_id: affId,
      }));

      const { error } = await supabase.from("vendor_affiliations").insert(vendorAffiliationsToInsert);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Fetch updated affiliations for this vendor
    const { data: updatedAffiliations } = await supabase
      .from("vendor_affiliations")
      .select("id, affiliation:affiliations(id, name, slug)")
      .eq("vendor_id", vendorId);

    // Fetch all affiliations for the dropdown
    const { data: allAffiliations } = await supabase
      .from("affiliations")
      .select("id, name, slug")
      .order("name", { ascending: true });

    return Response.json(
      {
        affiliations: updatedAffiliations ?? [],
        allAffiliations: allAffiliations ?? [],
        created: createdAffiliations,
      },
      { status: 200 }
    );
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
