import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "References in the News | Themes & Motifs",
  description: "Read about Themes & Motifs in the news. Snippets and features from top publications.",
};

const newsFeatures = [
  {
    publisher: "PeopleAsia",
    title: "Leading Wedding Expos in the Philippines",
    snippet: "Themes & Motifs continues to set the benchmark for bridal fairs in the Philippines, bringing together top wedding professionals to create the ultimate showcase of elegance and innovation.",
    link: "https://news.google.com/rss/articles/CBMihgFBVV95cUxOdUlVb3M4VjdMWF94X1ltbG1YdXRWZUtvdG9uNXNvNFJRMFdzUlJwbEZvdVZHa3hPNlN1MDJxVUk1QnlqVmdxNzR6aDlMcW11TXpVRkRNeW9yOEZtc2ZFaV9SZkk1T2RhenpnRHFsMlBSdFdnZGJRRmRpZjhydFZfUURCNHVYUQ?oc=5",
    date: "Featured News",
  },
  {
    publisher: "Brides",
    title: "13 Filipino Wedding Traditions You Need to Know",
    snippet: "Discover the rich cultural heritage of Filipino weddings. From the arrhae to the cord, tradition gracefully meets modern celebrations, supported by industry leaders who bring these timeless customs to life.",
    link: "https://news.google.com/rss/articles/CBMiakFVX3lxTE90a1ZPSUhXb3pYTWI5MWM1cXBpcmNlMmpNNkN1Nnh4ejkxd1BOLWNVV2dHMlJtUV8zZ3htYjN0RVlHRG5LQUdRR1JzMExCNU9wTUVOLVBuN2Y3bHA5ZkRJT3p3Njl6VDU3SGc?oc=5",
    date: "Featured News",
  },
  {
    publisher: "Preview.ph",
    title: "12 Breathtaking Vintage Venues",
    snippet: "Explore some of the most breathtaking vintage venues in the country. Carefully curated options ensure your perfect vintage-themed wedding becomes a memorable reality.",
    link: "https://news.google.com/rss/articles/CBMimgFBVV95cUxOc2NxMV9iY29WYlc0cUhvMjhhdGdJMUlTOTAzcHFiVkFhNHBtSkhlMkRSVDlBaWVyM1BQaElaek90a3FON05BRVo4X0s1R0VJV3VUeUV3d2Qtai01S1ljZHdtSDMyQ1NjMU1FcEoxWmJJYjBJUnNjZ2JzSTdzeVlPU3RqcjFBY2EwNzB0RGZlSmkwd2ZwSXRORjRB?oc=5",
    date: "Featured News",
  },
];

export default function ReferencesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            In The Press
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-headline">
            Themes & Motifs in the News
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-gray-500">
            Read about our latest features, industry highlights, and how we continue to elevate the wedding experience.
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {newsFeatures.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#a68b6a]/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-[#a68b6a]/10 px-2.5 py-0.5 text-xs font-medium text-[#a68b6a]">
                      {item.publisher}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2c2c2c] group-hover:text-[#a68b6a] transition-colors line-clamp-2 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-gray-500 mb-6">
                    "{item.snippet}"
                  </p>
                </div>
                <div className="mt-auto flex items-center text-[13px] font-semibold text-[#a68b6a] group-hover:text-[#957a5c]">
                  Read Full Article
                  <svg className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
