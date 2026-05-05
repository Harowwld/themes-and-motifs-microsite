import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import HashAuthRedirect from "../lib/HashAuthRedirect";
import ScrollContainer from "./components/ScrollContainer";
import BugReportButton from "./components/BugReportButton";
import NavWrapper from "./components/NavWrapper";
import { Providers } from "./providers";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Themes & Motifs | Wedding Vendor Directory",
  description: "Discover curated wedding vendors, themes, and motifs for your perfect celebration",
  icons: {
    icon: "/Adobe Express - file.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSerif.variable} ${plusJakarta.variable} antialiased`}
      >
        <Providers>
          <ScrollContainer>
            <HashAuthRedirect />
            <BugReportButton />
            <NavWrapper>{children}</NavWrapper>
          </ScrollContainer>
        </Providers>
      </body>
    </html>
  );
}
