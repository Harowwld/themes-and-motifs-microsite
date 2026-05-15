import { Metadata } from "next";
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
  return <LandingPage searchParams={searchParams} />;
}
