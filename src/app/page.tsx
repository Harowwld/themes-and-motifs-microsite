import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import LandingPage from "./LandingPage";
import ClientHomeRedirect from "./ClientHomeRedirect";

export const metadata: Metadata = {
  title: "Themes & Motifs | Discover Wedding Vendors",
  description: "Find the best wedding suppliers, caterers, photographers, and venues in the Philippines for your dream wedding.",
};

export default function Home() {
  return (
    <>
      <ClientHomeRedirect />
      <LandingPage />
    </>
  );
}
