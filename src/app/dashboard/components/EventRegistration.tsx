"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  X, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Trash2,
  Sparkles,
  Ticket
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { toast } from "@/lib/toast";

interface EventRegistrationProps {
  userId: string;
}

interface BridalFair {
  id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  venue: string;
  venue_address: string | null;
  image_url: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
}

interface FairRegistration {
  id: number;
  fair_id: number;
  name: string;
  email: string;
  phone: string | null;
  wedding_date: string | null;
  notes: string | null;
  created_at: string;
  bridal_fairs?: BridalFair;
}

export default function EventRegistration({ userId }: EventRegistrationProps) {
  const supabase = createSupabaseBrowserClient();
  
  const [fairs, setFairs] = useState<BridalFair[]>([]);
  const [registrations, setRegistrations] = useState<FairRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringFair, setRegisteringFair] = useState<BridalFair | null>(null);

  // Form inputs
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regWeddingDate, setRegWeddingDate] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active bridal fairs
      const { data: fairsData, error: fairsErr } = await supabase
        .from("bridal_fairs")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (fairsErr) throw fairsErr;
      setFairs(fairsData || []);

      // 2. Fetch registrations for the current user
      const { data: regsData, error: regsErr } = await supabase
        .from("fair_registrations")
        .select(`
          id,
          fair_id,
          name,
          email,
          phone,
          wedding_date,
          notes,
          created_at,
          bridal_fairs (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (regsErr) throw regsErr;
      setRegistrations((regsData as any) || []);

      // 3. Pre-populate profile information for default form use
      const { data: profile } = await supabase
        .from("soon_to_wed_profiles")
        .select("groom_nickname, bride_nickname, wedding_date")
        .eq("user_id", userId)
        .maybeSingle();

      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        setRegEmail(userData.user.email || "");
      }

      if (profile) {
        const groom = profile.groom_nickname || "";
        const bride = profile.bride_nickname || "";
        if (groom && bride) {
          setRegName(`${groom} & ${bride}`);
        } else if (groom || bride) {
          setRegName(groom || bride);
        } else if (userData?.user?.email) {
          setRegName(userData.user.email.split("@")[0]);
        }
        
        if (profile.wedding_date) {
          setRegWeddingDate(profile.wedding_date);
        }
      }
    } catch (e) {
      console.error("Error loading event registrations data:", e);
      toast.error("Failed to load events data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegister = (fair: BridalFair) => {
    setRegisteringFair(fair);
  };

  const handleCloseRegister = () => {
    setRegisteringFair(null);
    setRegNotes("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringFair) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("fair_registrations")
        .insert({
          fair_id: registeringFair.id,
          user_id: userId,
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim() || null,
          wedding_date: regWeddingDate || null,
          notes: regNotes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Successfully registered for ${registeringFair.title}!`);
      handleCloseRegister();
      await loadData();
    } catch (err: any) {
      console.error("Error registering for event:", err);
      toast.error(err.message || "Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async (regId: number, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for ${eventTitle}?`)) return;

    try {
      const { error } = await supabase
        .from("fair_registrations")
        .delete()
        .eq("id", regId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success(`Registration for ${eventTitle} has been cancelled.`);
      await loadData();
    } catch (err) {
      console.error("Error cancelling registration:", err);
      toast.error("Failed to cancel registration.");
    }
  };

  const getFormattedDate = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    let text = startDate.toLocaleDateString("en-US", options);
    if (endDate && start !== end) {
      text += ` - ${endDate.toLocaleDateString("en-US", options)}`;
    }
    return text;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-[family-name:var(--font-plus-jakarta)]">
        <div className="animate-spin rounded-full h-9 w-9 border-3 border-t-transparent border-[#a68b6a]"></div>
        <p className="text-sm text-neutral-400 font-medium">Retrieving wedding event details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn font-[family-name:var(--font-plus-jakarta)]">
      
      {/* Introduction Header Banner */}
      <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 max-w-xl">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#a68b6a]/10 text-[#a68b6a] text-[10px] font-bold uppercase tracking-wider">
            Themes & Motifs Fairs
          </span>
          <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
            Bridal Fairs & Wedding Expos
          </h3>
          <p className="text-[13px] text-neutral-400 leading-relaxed">
            Gain free entry to the Philippines' most prestigious wedding expos. Meet certified vendors in person, access exclusive deals, and win huge door prizes!
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#a68b6a]/15 to-[#a68b6a]/5 border border-[#a68b6a]/20 flex items-center justify-center shrink-0">
          <Ticket className="text-[#a68b6a] h-6 w-6" />
        </div>
      </div>

      {/* 1. MY PASSES / ACTIVE REGISTRATIONS */}
      {registrations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-black/[0.04]">
            <CheckCircle2 size={16} className="text-[#a68b6a]" />
            <h4 className="text-[15px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
              Your Active Entry Passes
            </h4>
            <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full ml-auto">
              {registrations.length} Registered
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {registrations.map((reg) => {
              const fair = reg.bridal_fairs;
              if (!fair) return null;
              const dateStr = getFormattedDate(fair.start_date, fair.end_date);
              
              return (
                <div 
                  key={reg.id} 
                  className="bg-white border border-[#a68b6a]/25 rounded-2xl shadow-[0_4px_20px_rgba(166,139,106,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(166,139,106,0.08)] flex flex-col justify-between"
                >
                  <div className="p-5 flex gap-4">
                    {/* Event mini-image or ticket icon box */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5 bg-[#fcfbf9] relative">
                      {fair.image_url ? (
                        <img src={fair.image_url} alt={fair.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#a68b6a]/10">
                          <Ticket className="h-6 w-6 text-[#a68b6a]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 uppercase tracking-wider">
                          Active Pass ✓
                        </span>
                        {fair.is_featured && (
                          <span className="text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-100 rounded px-1.5 py-0.5 uppercase tracking-wider">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-[14px] text-neutral-800 leading-snug truncate">
                        {fair.title}
                      </h5>
                      <div className="space-y-1 text-[11px] text-neutral-500 font-semibold">
                        <p className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#a68b6a]" />
                          <span>{dateStr}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#a68b6a]" />
                          <span className="truncate">{fair.venue}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BARCODE SECTION representing digital pass */}
                  <div className="px-5 py-4 bg-gradient-to-r from-neutral-50 to-white border-t border-[#a68b6a]/15 flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-[140px] opacity-75 select-none">
                      {/* Generates a clean barcode-like layout */}
                      <div className="flex items-center justify-between h-7 gap-0.5 bg-neutral-900 px-2.5 py-1 rounded">
                        {Array.from({ length: 24 }).map((_, idx) => {
                          const w = (idx % 3 === 0) ? "w-[1px]" : (idx % 5 === 0) ? "w-[3px]" : "w-[2px]";
                          return <div key={idx} className={`${w} h-full bg-white`} />;
                        })}
                      </div>
                      <div className="text-[8px] text-neutral-400 font-mono tracking-widest text-center mt-1">
                        TM-REG-{reg.id}-{fair.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelRegistration(reg.id, fair.title)}
                        className="h-8 px-3 rounded-lg border border-red-200 hover:border-red-300 text-red-500 hover:bg-red-50/50 text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Cancel Entry Pass"
                      >
                        <Trash2 size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. UPCOMING BRIDAL FAIRS FOR REGISTRATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-black/[0.04]">
          <Calendar size={16} className="text-[#a68b6a]" />
          <h4 className="text-[15px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
            Explore Upcoming Expos
          </h4>
        </div>

        {fairs.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-2xl p-10 text-center space-y-3">
            <p className="text-[13px] text-neutral-400 leading-relaxed max-w-md mx-auto">
              There are currently no active bridal fairs or event registrations scheduled in the system. Check back later for the next big Themes & Motifs show!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {fairs.map((fair) => {
              const isAlreadyRegistered = registrations.some((r) => r.fair_id === fair.id);
              const dateStr = getFormattedDate(fair.start_date, fair.end_date);

              return (
                <div 
                  key={fair.id} 
                  className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row"
                >
                  {/* Event Showcase Image */}
                  <div className="md:w-[28%] w-full min-h-[160px] md:min-h-auto relative bg-neutral-100 overflow-hidden shrink-0">
                    {fair.image_url ? (
                      <img src={fair.image_url} alt={fair.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a68b6a]/15 to-[#a68b6a]/5">
                        <Award className="h-10 w-10 text-[#a68b6a]" />
                      </div>
                    )}
                    {fair.is_featured && (
                      <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-black uppercase tracking-widest text-[#a68b6a]">
                        <span>Wedding Event Showcase</span>
                        <span>•</span>
                        <span>DOT-Accredited</span>
                      </div>
                      
                      <h5 className="font-bold text-[16px] text-neutral-800 leading-snug font-[family-name:var(--font-noto-serif)]">
                        {fair.title}
                      </h5>

                      <p className="text-[12.5px] text-neutral-500 leading-relaxed font-[family-name:var(--font-plus-jakarta)] font-normal line-clamp-2">
                        {fair.description || "Join us at this prestigious Themes & Motifs bridal event. Avail of massive booking discounts, view spectacular design pavilions, and meet local top suppliers in person."}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[12px] font-semibold text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#a68b6a]" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#a68b6a]" />
                          <span>{fair.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/[0.04] pt-4 gap-4">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Entry Ticket: <strong className="text-emerald-600 font-extrabold">FREE</strong>
                      </span>

                      {isAlreadyRegistered ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                          <CheckCircle2 size={13} />
                          <span>Already Registered</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenRegister(fair)}
                          className="h-9 px-5 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[11px] font-bold rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                        >
                          <span>Register Free</span>
                          <ChevronRight size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* simulated RSVP/Registration dialog popup */}
      {registeringFair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn select-none">
          <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            
            <button
              onClick={handleCloseRegister}
              className="absolute top-4 right-4 h-8 w-8 text-neutral-400 hover:text-neutral-600 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <div className="flex justify-center text-[#a68b6a] mb-2">
                <Ticket className="h-10 w-10 text-[#a68b6a] animate-pulse" />
              </div>
              <h3 className="text-[18px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)] mt-2">
                Exhibition Guest Registration
              </h3>
              <p className="text-[12px] text-neutral-400 mt-1">
                Complete your free entry pass details for
              </p>
              <p className="text-[12.5px] font-bold text-[#a68b6a] mt-0.5 truncate px-2">
                {registeringFair.title}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                  <User size={11} />
                  <span>Registrant / Couple Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Wilson & Diana"
                  className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Mail size={11} />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. couple@gmail.com"
                    className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Phone size={11} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +639171234567"
                    className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Calendar size={11} />
                    <span>Target Wedding Date</span>
                  </label>
                  <input
                    type="date"
                    value={regWeddingDate}
                    onChange={(e) => setRegWeddingDate(e.target.value)}
                    className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                  <FileText size={11} />
                  <span>Special Inquiries / Notes</span>
                </label>
                <textarea
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="Any specific supplier details or category matches you are looking for?"
                  rows={3}
                  className="w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 p-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-[#a68b6a] hover:bg-[#957a5c] disabled:bg-neutral-300 text-white text-[12px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Get Free Entry Pass</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
