import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { 
  Users, 
  Store, 
  ClipboardCheck, 
  MessageSquare, 
  Ticket, 
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperadminPage() {
  const supabase = createSupabaseAdminClient();

  // Fetch counts in parallel
  const [
    { count: vendorCount },
    { count: inquiryCount },
    { count: promoCount },
    { count: userCount },
    { count: reviewCount },
    { data: inquiriesData },
    { data: vendorsData },
  ] = await Promise.all([
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("promos").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "soon_to_wed"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*, vendors(business_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("vendors").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const latestInquiries = (inquiriesData as any[]) ?? [];
  const newestVendors = (vendorsData as any[]) ?? [];

  const stats = [
    { label: "Total Vendors", value: vendorCount ?? 0, icon: Store, color: "text-blue-600", bg: "bg-blue-50", href: "/superadmin/vendors" },
    { label: "Total Inquiries", value: inquiryCount ?? 0, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", href: "/superadmin/inquiries" },
    { label: "Active Promos", value: promoCount ?? 0, icon: Ticket, color: "text-green-600", bg: "bg-green-50", href: "/superadmin/promos" },
    { label: "Soon to Weds", value: userCount ?? 0, icon: Users, color: "text-pink-600", bg: "bg-pink-50", href: "/superadmin/users" },
    { label: "Total Reviews", value: reviewCount ?? 0, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", href: "/superadmin/reviews" },
  ];

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Analytics</div>
            <div className="mt-1 text-[12px] text-black/45">Overview of site performance and activity.</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#fcfbf9] border border-black/5 flex items-center justify-center text-[#a67c52]">
            <TrendingUp size={20} />
          </div>
        </div>
        
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Main Grid for Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit self-start">
          <div className="px-5 py-4 border-b border-black/5 bg-gray-50/50">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Recent Inquiries</div>
          </div>
          <div className="p-0">
            {latestInquiries.length > 0 ? (
              <div className="divide-y divide-black/5">
                {latestInquiries.map((iq) => (
                  <div key={iq.id} className="p-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#2c2c2c]">{iq.name || "Anonymous"}</span>
                      <span className="text-[11px] text-black/40">{new Date(iq.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[12px] text-black/60 truncate">
                      To: <span className="font-medium">{iq.vendors?.business_name}</span>
                    </div>
                    <div className="text-[12px] text-black/45 line-clamp-1 italic">"{iq.message}"</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[12px] text-black/40">No recent inquiries</div>
            )}
            <div className="p-3 bg-gray-50/50 border-t border-black/5">
              <Link href="/superadmin/inquiries" className="text-[12px] font-semibold text-[#a67c52] hover:underline flex items-center gap-1">
                View all inquiries <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit self-start">
          <div className="px-5 py-4 border-b border-black/5 bg-gray-50/50">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Newest Vendors</div>
          </div>
          <div className="p-0">
            {newestVendors.length > 0 ? (
              <div className="divide-y divide-black/5">
                {newestVendors.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#2c2c2c]">{v.business_name}</span>
                      <span className="text-[11px] text-black/40">{v.city || "No location"}</span>
                    </div>
                    <Link href={`/superadmin/vendors?id=${v.id}`} className="p-2 rounded-[3px] hover:bg-black/5 text-[#a67c52]">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[12px] text-black/40">No vendors found</div>
            )}
            <div className="p-3 bg-gray-50/50 border-t border-black/5">
              <Link href="/superadmin/vendors" className="text-[12px] font-semibold text-[#a67c52] hover:underline flex items-center gap-1">
                Manage all vendors <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit self-start">
          <div className="px-5 py-4 border-b border-black/5 bg-gray-50/50">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">System Health</div>
          </div>
          <div className="p-5 space-y-4">
             <HealthItem label="Database Status" status="Healthy" color="text-green-600" />
             <HealthItem label="Storage Usage" status="Normal" color="text-green-600" />
             <HealthItem label="Last Backup" status="2 hours ago" color="text-blue-600" />
          </div>
        </div>

        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit self-start">
          <div className="px-5 py-4 border-b border-black/5 bg-gray-50/50">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Quick Management</div>
          </div>
          <div className="p-2 grid gap-1">
            <QuickLinkItem title="Manage Themes" href="/superadmin/themes" />
            <QuickLinkItem title="Editors List" href="/superadmin/editors" />
            <QuickLinkItem title="Global Settings" href="/superadmin/settings" />
            <QuickLinkItem title="Verification Docs" href="/superadmin/verification-documents" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, href }: any) {
  return (
    <Link 
      href={href}
      className="group rounded-[3px] border border-black/10 bg-white hover:border-[#a67c52]/30 transition-all p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-[3px] ${bg} ${color}`}>
          <Icon size={18} />
        </div>
        <div className="text-black/20 group-hover:text-[#a67c52] transition-colors">
          <ArrowRight size={16} />
        </div>
      </div>
      <div>
        <div className="text-[24px] font-bold text-[#2c2c2c] tracking-tight">{value.toLocaleString()}</div>
        <div className="text-[12px] font-medium text-black/45 uppercase tracking-wider">{label}</div>
      </div>
    </Link>
  );
}

function HealthItem({ label, status, color }: any) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-black/60">{label}</span>
      <span className={`font-semibold ${color}`}>{status}</span>
    </div>
  );
}

function QuickLinkItem({ title, href }: any) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-[3px] hover:bg-black/[0.03] text-[13px] text-black/75 transition-colors"
    >
      <span>{title}</span>
      <ArrowRight size={14} className="text-black/20" />
    </Link>
  );
}
