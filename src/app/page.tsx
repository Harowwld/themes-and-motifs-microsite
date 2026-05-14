import { redirect } from "next/navigation";
import LandingPage from "./LandingPage";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  
  // If we have an auth code on the root, redirect to the verify page
  if (params.code) {
    redirect(`/editor/verify?code=${params.code}`);
  }

  return <LandingPage searchParams={searchParams} />;
}
