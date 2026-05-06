import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import HashAuthRedirect from "../lib/HashAuthRedirect";
import ScrollContainer from "./components/ScrollContainer";
import BugReportButton from "./components/BugReportButton";
import NavWrapper from "./components/NavWrapper";
import PageCacheProvider from "./components/PageCacheProvider";
import { Providers } from "./providers";
import SpeculationRules from "./components/SpeculationRules";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Themes & Motifs | Wedding Vendor Directory",
  description: "Discover curated wedding vendors, themes, and motifs for your perfect celebration",
  icons: {
    icon: "/Adobe Express - file.png",
  },
  other: {
    // Preconnect to Google Fonts CDN for faster font loading
    preconnect: "https://fonts.gstatic.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Speculation Rules API - Chrome 109+ prerendering */}
        <SpeculationRules />
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${notoSerif.variable} ${plusJakarta.variable} antialiased`}
      >
        <Providers>
          <PageCacheProvider>
            <ScrollContainer>
              <HashAuthRedirect />
              <BugReportButton />
              <NavWrapper>{children}</NavWrapper>
            </ScrollContainer>
          </PageCacheProvider>
        </Providers>
        {/* instant.page - Hover prefetching for Safari/Firefox */}
        <Script
          src="//instant.page/5.2.0"
          type="module"
          strategy="lazyOnload"
          integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUog+aSTojFNFj"
        />
      </body>
    </html>
  );
}
