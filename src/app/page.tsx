import LandingPage from "./LandingPage";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LandingPage searchParams={searchParams} />;
}
