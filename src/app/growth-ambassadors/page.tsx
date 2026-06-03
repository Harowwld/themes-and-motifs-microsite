import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Growth Ambassadors | Themes & Motifs",
  description: "Meet our provincial sales representatives and growth ambassadors.",
};

export default function GrowthAmbassadorsPage() {
  const ambassadors = [
    {
      id: 1,
      name: "Maria Santos",
      region: "Cebu",
      contact: "maria.santos@themesnmotifs.com",
      phone: "+63 917 123 4567",
      initials: "MS",
    },
    {
      id: 2,
      name: "Juan Dela Cruz",
      region: "Davao",
      contact: "juan.delacruz@themesnmotifs.com",
      phone: "+63 918 234 5678",
      initials: "JD",
    },
    {
      id: 3,
      name: "Ana Reyes",
      region: "Iloilo",
      contact: "ana.reyes@themesnmotifs.com",
      phone: "+63 919 345 6789",
      initials: "AR",
    },
    {
      id: 4,
      name: "Carlos Mendoza",
      region: "Baguio",
      contact: "carlos.mendoza@themesnmotifs.com",
      phone: "+63 920 456 7890",
      initials: "CM",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            Connect With Us Nationwide
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-4xl font-headline">
            Growth Ambassadors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-gray-500">
            Meet our dedicated provincial sales representatives. Reach out to the ambassador in your region to learn how Themes & Motifs can help elevate your wedding business.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {ambassadors.map((ambassador) => (
              <div key={ambassador.id} className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#a68b6a]/10 text-xl font-bold text-[#a68b6a]">
                  {ambassador.initials}
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#2c2c2c] font-headline">{ambassador.name}</h3>
                  <div className="mt-1 flex items-center text-[13px] font-medium text-[#a68b6a]">
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ambassador.region}
                  </div>
                  <div className="mt-3 space-y-1">
                    <a href={`mailto:${ambassador.contact}`} className="flex items-center text-[14px] text-gray-500 hover:text-[#a68b6a] transition-colors">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {ambassador.contact}
                    </a>
                    <a href={`tel:${ambassador.phone.replace(/\s+/g, '')}`} className="flex items-center text-[14px] text-gray-500 hover:text-[#a68b6a] transition-colors">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {ambassador.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
