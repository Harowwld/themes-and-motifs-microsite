import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import LandingPage from "./LandingPage";
import ClientHomeRedirect from "./ClientHomeRedirect";

export const metadata: Metadata = {
  title: "Themes & Motifs The Wedding App | Discover Wedding Vendors",
  description: "Find the best wedding suppliers, caterers, photographers, and venues in the Philippines for your dream wedding.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <ClientHomeRedirect />
      <LandingPage searchParams={searchParams} />
    </>
  );
}
