import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Partners | Themes & Motifs",
  description: "Explore our trusted affiliate partners for travel, accommodation, and wedding essentials.",
};

const affiliates = [
  {
    name: "Expedia",
    link: "https://www.expedia.com",
    logoColor: "#000080",
    description: "Your ultimate gateway for booking honeymoon flights and premium accommodations.",
  },
  {
    name: "Klook",
    link: "https://www.klook.com",
    logoColor: "#ff5b00",
    description: "Discover and book amazing activities and experiences for your destination wedding or honeymoon.",
  },
  {
    name: "Shopee",
    link: "https://shopee.ph",
    logoColor: "#ee4d2d",
    description: "Find affordable wedding essentials, favors, and DIY materials delivered right to your doorstep.",
  },
  {
    name: "Agoda",
    link: "https://www.agoda.com",
    logoColor: "#5392f9",
    description: "Secure the best deals on hotels and resorts for you and your wedding guests worldwide.",
  },
];

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-[family-name:var(--font-plus-jakarta)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 border-b border-gray-100 shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            Our Partners
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-headline">
            Affiliate Partners
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-gray-500">
            We've partnered with top brands to help make your wedding planning and honeymoon preparations as seamless as possible.
          </p>
        </div>
      </section>

      {/* Centered Content */}
      <section className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 place-items-center justify-center">
            {affiliates.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#a68b6a]/20"
              >
                <div className="mb-4 h-12 flex items-center justify-center">
                  <img src={`/affiliates/${item.name.toLowerCase()}-logo.svg`} alt={`${item.name} logo`} className="h-full w-auto object-contain" />
                </div>
                <p className="text-[13px] leading-relaxed text-gray-500 mb-6 px-2">
                  {item.description}
                </p>
                <div className="mt-auto inline-flex items-center text-[12px] font-semibold text-gray-400 group-hover:text-[#a68b6a] transition-colors">
                  Visit Website
                  <svg className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
