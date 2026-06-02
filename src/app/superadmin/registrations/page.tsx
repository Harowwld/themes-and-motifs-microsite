"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Download, RefreshCw, Trash2, Search, Calendar, Filter, MapPin } from "lucide-react";

interface BridalFair {
  id: number;
  title: string;
  venue: string;
}

interface FairRegistration {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  wedding_date: string | null;
  notes: string | null;
  created_at: string;
  bridal_fairs: BridalFair | null;
}

function fmtDate(iso: any) {
  const s = String(iso ?? "");
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return s;
  }
}

export default function SuperadminRegistrationsPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FairRegistration[]>([]);
  const [fairs, setFairs] = useState<BridalFair[]>([]);
  const [query, setQuery] = useState("");
  const [selectedFairId, setSelectedFairId] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      // 1. Fetch registrations
      const { data: regsData, error: regsErr } = await supabase
        .from("fair_registrations")
        .select(`
          id,
          name,
          email,
          phone,
          wedding_date,
          notes,
          created_at,
          bridal_fairs (id, title, venue)
        `)
        .order("created_at", { ascending: false });

      if (regsErr) throw regsErr;
      setItems((regsData as any) || []);

      // 2. Fetch active events/fairs list for filtering
      const { data: fairsData, error: fairsErr } = await supabase
        .from("bridal_fairs")
        .select("id, title, venue")
        .order("start_date", { ascending: false });

      if (fairsErr) throw fairsErr;
      setFairs(fairsData || []);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    let result = items;

    // Filter by Event
    if (selectedFairId !== "all") {
      const fairIdNum = parseInt(selectedFairId);
      result = result.filter((x) => x.bridal_fairs?.id === fairIdNum);
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (!q) return result;

    return result.filter((x) => {
      return (
        String(x.id).includes(q) ||
        String(x.name ?? "").toLowerCase().includes(q) ||
        String(x.email ?? "").toLowerCase().includes(q) ||
        String(x.phone ?? "").toLowerCase().includes(q) ||
        String(x.notes ?? "").toLowerCase().includes(q) ||
        String(x.bridal_fairs?.title ?? "").toLowerCase().includes(q) ||
        String(x.bridal_fairs?.venue ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query, selectedFairId]);

  const confirmDeleteRegistration = async (id: number) => {
    try {
      const { error } = await supabase
        .from("fair_registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Event registration removed.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to delete registration.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headers = ["Registration ID", "Registration Date", "Name", "Email", "Phone", "Wedding Date", "Event Title", "Venue", "Notes"];
    const rows = filtered.map(x => [
      x.id,
      x.created_at,
      x.name,
      x.email,
      x.phone || "",
      x.wedding_date || "",
      x.bridal_fairs?.title || "",
      x.bridal_fairs?.venue || "",
      x.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bridal_fair_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  return (
    <div className="grid gap-6 font-[family-name:var(--font-plus-jakarta)]">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        
        {/* Header Block */}
        <div className="px-6 py-5 border-b border-b-neutral-100 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Event Registrations
            </div>
            <div className="mt-1 text-[12px] text-black/45">
              View and export guest registrations for Themes & Motifs bridal fairs and wedding expos.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={filtered.length === 0}
              className="h-9 px-4 rounded-[3px] bg-[#a68b6a] hover:bg-[#957a5c] disabled:bg-neutral-300 text-white text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition-colors"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="h-9 w-9 rounded-[3px] border border-black/10 bg-white hover:bg-black/5 text-black/60 flex items-center justify-center cursor-pointer transition-colors"
              title="Refresh lists"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-6 pb-2 grid gap-4 md:grid-cols-[1fr_240px]">
          
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-black/35">
              <Search size={15} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full pl-9 pr-3 rounded-[3px] border border-black/10 bg-white text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              placeholder="Search by registrant name, email, phone, event, or notes..."
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-black/35">
              <Filter size={14} />
            </span>
            <select
              value={selectedFairId}
              onChange={(e) => setSelectedFairId(e.target.value)}
              className="h-10 w-full pl-9 pr-3 rounded-[3px] border border-black/10 bg-white text-[13px] outline-none focus:border-[#a67c52]/50 cursor-pointer"
            >
              <option value="all">All Events</option>
              {fairs.map((fair) => (
                <option key={fair.id} value={fair.id}>
                  {fair.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="px-6 pb-6">
          <div className="rounded-[3px] border border-black/10 overflow-hidden bg-white">
            
            {/* Table Header */}
            <div className="grid grid-cols-[80px_160px_1.5fr_1.2fr_1.5fr_100px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2.5">Reg ID</div>
              <div className="px-3 py-2.5">Registered On</div>
              <div className="px-3 py-2.5">Event Details</div>
              <div className="px-3 py-2.5">Couple Name / Contacts</div>
              <div className="px-3 py-2.5">Notes</div>
              <div className="px-3 py-2.5 text-center">Actions</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[13px] text-black/40 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-[#a68b6a]"></div>
                <span>Loading registrations...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-[13px] text-black/40">
                No event registrations found.
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => (
                  <div key={x.id} className="grid grid-cols-[80px_160px_1.5fr_1.2fr_1.5fr_100px] hover:bg-neutral-50/50 transition-colors">
                    
                    {/* ID */}
                    <div className="px-3 py-4 text-[13px] text-black/60 font-semibold">{x.id}</div>
                    
                    {/* Created date */}
                    <div className="px-3 py-4 text-[12px] text-black/55">{fmtDate(x.created_at)}</div>

                    {/* Event details */}
                    <div className="px-3 py-4">
                      {x.bridal_fairs ? (
                        <>
                          <div className="text-[13px] font-bold text-[#2c2c2c]">
                            {x.bridal_fairs.title}
                          </div>
                          <div className="text-[11px] text-black/40 mt-1 flex items-center gap-1 font-semibold">
                            <MapPin size={10} className="text-[#a68b6a]" />
                            <span>{x.bridal_fairs.venue}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[12px] text-black/35 italic">Deleted Event</span>
                      )}
                    </div>

                    {/* Contacts info */}
                    <div className="px-3 py-4 space-y-1">
                      <div className="text-[13px] font-bold text-[#2c2c2c]">{x.name}</div>
                      <div className="text-[11px] text-black/50 font-medium flex items-center gap-1">
                        <span>✉</span>
                        <span className="truncate">{x.email}</span>
                      </div>
                      {x.phone && (
                        <div className="text-[11px] text-black/45 font-medium flex items-center gap-1">
                          <span>☎</span>
                          <span>{x.phone}</span>
                        </div>
                      )}
                      {x.wedding_date && (
                        <div className="text-[11px] text-[#a68b6a] font-bold flex items-center gap-1 mt-1 uppercase tracking-wider text-[9px]">
                          <Calendar size={10} />
                          <span>Wedding: {new Date(x.wedding_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="px-3 py-4">
                      {x.notes ? (
                        <p className="text-[12.5px] text-black/60 leading-relaxed max-w-sm whitespace-pre-wrap italic">
                          "{x.notes}"
                        </p>
                      ) : (
                        <span className="text-[11px] text-black/30 italic">None</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-4 flex items-center justify-center">
                      {deletingId === x.id ? (
                        <div className="flex flex-col gap-1 items-center justify-center text-[10px]">
                          <span className="font-bold text-[#b42318] uppercase tracking-wide">Confirm?</span>
                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => confirmDeleteRegistration(x.id)}
                              className="text-[#b42318] font-bold hover:underline cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="text-black/55 hover:underline cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(x.id)}
                          className="h-8 w-full rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] text-[11px] font-bold uppercase tracking-wider text-[#b42318] hover:bg-[#ffe4e8] transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
