import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import LandingPage from "./LandingPage";

export const metadata: Metadata = {
  title: "Themes & Motifs | Discover Wedding Vendors",
  description: "Find the best wedding suppliers, caterers, photographers, and venues in the Philippines for your dream wedding.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const isHomeBypass = resolvedSearchParams.home === "true";

  if (!isHomeBypass) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (userData?.role === "soon_to_wed") {
        redirect(`/moments/couple/${user.id}`);
      }
    }
  }

  return <LandingPage searchParams={searchParams} />;
}
