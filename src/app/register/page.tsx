import { createSupabaseServerClient } from "../../lib/supabaseServer";

import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const preselectedPlan = resolvedSearchParams.plan as string | undefined;

  const supabase = createSupabaseServerClient();

  const [{ data: categories }, { data: regionRows }, { data: plans }, { data: affiliations }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("display_order", { ascending: true }).order("name", { ascending: true }).limit(200),
    supabase.from("regions").select("id,name,parent_id").order("name", { ascending: true }).limit(2000),
    supabase.from("plans").select("id,name").order("id", { ascending: true }).limit(20),
    supabase.from("affiliations").select("id,name,slug").order("name", { ascending: true }).limit(500),
  ]);

  const allRegions = (regionRows ?? []) as { id: number; name: string; parent_id: number | null }[];
  const regions = allRegions.filter((r) => r.parent_id == null).map((r) => ({ id: r.id, name: r.name }));
  const cities = allRegions
    .filter((r) => r.parent_id != null)
    .map((r) => ({ id: r.id, name: r.name, region_id: r.parent_id as number }));

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
          <div className="text-[12px] font-semibold text-black/45">For vendors</div>
          <h1 className="mt-1 text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#2c2c2c]">
            Vendor registration
          </h1>
          <div className="mt-2 text-[13px] text-black/55">
            Submit your details for review. Once approved, we’ll activate your listing.
          </div>

          <div className="mt-6">
            <RegisterForm
              categories={(categories ?? []) as { id: number; name: string; slug: string }[]}
              regions={regions}
              cities={cities}
              plans={(plans ?? []) as { id: number; name: string }[]}
              affiliations={(affiliations ?? []) as { id: number; name: string; slug: string }[]}
              preselectedPlan={preselectedPlan}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
