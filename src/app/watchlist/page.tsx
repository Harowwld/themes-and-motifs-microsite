import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist | Themes & Motifs The Wedding App",
  description: "Themes & Motifs The Wedding App Watchlist of Erring Accounts.",
};

export default function WatchlistPage() {
  const erringAccounts = [
    { id: 1, name: "Sample Supplier A", reason: "Multiple unresolved complaints", date: "2025-10-12" },
    { id: 2, name: "Sample Supplier B", reason: "Fraudulent activities", date: "2026-01-05" },
    { id: 3, name: "Sample Supplier C", reason: "Violation of Terms of Service", date: "2026-03-20" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-4xl font-headline">
            Watchlist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-gray-500">
            For the safety and peace of mind of our couples, we maintain this watchlist of erring accounts and entities that have violated our community guidelines or failed to uphold professional standards.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                    Entity Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                    Date Listed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {erringAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-[14px] font-medium text-gray-900">{account.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] text-gray-600">{account.reason}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[14px] text-gray-500">
                      {account.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {erringAccounts.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-[14px]">
                No erring accounts listed at this time.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
