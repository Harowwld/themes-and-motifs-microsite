export default async function SuperadminPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Dashboard</div>
          <div className="mt-1 text-[12px] text-black/45">Quick links to manage the site.</div>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink title="Vendors" href="/superadmin/vendors" description="Activate, feature, and assign plans." />
          <QuickLink title="Registrations" href="/superadmin/registrations" description="Approve or reject new vendor signups." />
          <QuickLink title="Promos" href="/superadmin/promos" description="Manage active promos and featured deals." />
          <QuickLink title="Themes" href="/superadmin/themes" description="Manage wedding themes and custom themes." />
          <QuickLink title="Inquiries" href="/superadmin/inquiries" description="View inquiries sent to vendors." />
          <QuickLink title="Reviews" href="/superadmin/reviews" description="Moderate reviews and status." />
          <QuickLink title="Soon to Weds" href="/superadmin/users" description="View soon to wed accounts." />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[3px] border border-black/10 bg-white hover:bg-black/2 transition-colors px-5 py-4"
    >
      <div className="text-[14px] font-semibold text-[#2c2c2c]">{title}</div>
      <div className="mt-1 text-[12px] text-black/50">{description}</div>
    </a>
  );
}
