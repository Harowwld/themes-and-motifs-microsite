import LandingPage from "./LandingPage";

export default async function Home({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <LandingPage searchParams={resolvedSearchParams} />;
}
