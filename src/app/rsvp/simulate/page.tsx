"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { 
  Heart, 
  Mail, 
  Phone, 
  AlertCircle, 
  Utensils, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users
} from "lucide-react";

type GuestDetails = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  dietary: string;
  rsvpStatus: "pending" | "attending" | "declined";
  tableId: string | null;
  tableName: string | null;
};

function RSVPSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const guestIdParam = searchParams.get("guestId");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // System states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [allGuests, setAllGuests] = useState<any[]>([]);
  const [guest, setGuest] = useState<GuestDetails | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form states
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined" | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietary, setDietary] = useState("");

  // Load guests list for simulator selection if no guestId provided
  const loadAllGuests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is logged in, fetch their guests so they can easily test/simulate
      if (session?.user) {
        const { data, error } = await supabase
          .from("wedding_guests")
          .select("*")
          .eq("user_id", session.user.id)
          .order("name", { ascending: true });

        if (!error && data) {
          setAllGuests(data);
        }
      } else {
        // If not logged in, fetch a few public test records if available
        const { data, error } = await supabase
          .from("wedding_guests")
          .select("id, name, rsvp_status")
          .limit(10);

        if (!error && data) {
          setAllGuests(data);
        }
      }
    } catch (err) {
      console.error("Error loading guests for selection:", err);
    }
  };

  // Load guest details by UUID
  useEffect(() => {
    async function loadGuestDetails() {
      if (!guestIdParam) {
        await loadAllGuests();
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/rsvp?guestId=${guestIdParam}`);
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
          await loadAllGuests();
        } else if (data.guest) {
          setGuest(data.guest);
          setRsvpStatus(data.guest.rsvpStatus === "pending" ? "attending" : data.guest.rsvpStatus);
          setEmail(data.guest.email || "");
          setPhone(data.guest.phone || "");
          setDietary(data.guest.dietary || "");
        }
      } catch (err) {
        console.error("Error loading guest details:", err);
        toast.error("Could not fetch invitation details.");
      } finally {
        setLoading(false);
      }
    }

    loadGuestDetails();
  }, [guestIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestIdParam || !rsvpStatus) return;

    try {
      setSubmittingRsvp(true);
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guestId: guestIdParam,
          rsvpStatus,
          email,
          phone,
          dietary
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSubmittedSuccess(true);
      toast.success("💖 Your response has been saved. Thank you!");
    } catch (err: any) {
      console.error("Error submitting RSVP:", err);
      toast.error(err.message || "Failed to submit RSVP");
    } finally {
      setSubmittingRsvp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a68b6a]"></div>
          <p className="text-sm font-medium text-neutral-500 font-[family-name:var(--font-plus-jakarta)] animate-pulse">
            Opening your personal wedding invitation...
          </p>
        </div>
      </div>
    );
  }

  // Simulator Guest Selector View (If guestId parameter is not found or not active)
  if (!guestIdParam) {
    return (
      <div className="min-h-screen bg-[#faf8f5] relative overflow-hidden py-16 px-4">
        {/* Background elegant accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#a68b6a]/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#a68b6a]/5 blur-3xl" />

        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#a68b6a]/10 text-[#a68b6a] mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              RSVP Invitation Portal
            </h1>
            <p className="mt-2 text-sm text-neutral-500 font-[family-name:var(--font-plus-jakarta)] max-w-sm mx-auto">
              Simulate or complete a wedding guest invitation response using secure guest access codes.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#a68b6a]/10 shadow-[0_12px_40px_rgba(166,139,106,0.06)] p-6">
            <h2 className="text-[16px] font-semibold text-neutral-800 font-[family-name:var(--font-noto-serif)] flex items-center gap-2 mb-4 pb-3 border-b border-black/5">
              <Users className="h-4 w-4 text-[#a68b6a]" />
              Select a Guest to Simulate
            </h2>

            {allGuests.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-[#a68b6a]/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
                  No guest records found in this workspace.
                </p>
                <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto">
                  Please log in to your Soon-to-Wed dashboard and add guests under the Guest List Tracker tab first!
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 px-4 py-2 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 sleek-scrollbar">
                {allGuests.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => router.push(`/rsvp/simulate?guestId=${g.id}`)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-black/5 bg-[#fafbf9] hover:bg-[#a68b6a]/5 hover:border-[#a68b6a]/30 text-left transition-all group"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                        {g.name}
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium font-[family-name:var(--font-plus-jakarta)] mt-0.5">
                        Category: {g.category || "Family"} · RSVP: {g.rsvp_status || g.rsvpStatus || "pending"}
                      </p>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-[#a68b6a]/10 flex items-center justify-center text-[#a68b6a] group-hover:bg-[#a68b6a] group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-black/5 text-center">
              <p className="text-xs text-neutral-400 font-[family-name:var(--font-plus-jakarta)]">
                Want to return to dashboard?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="text-[#a68b6a] hover:text-[#957a5c] font-semibold hover:underline"
                >
                  Dashboard
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] relative overflow-hidden py-12 px-4 flex items-center justify-center">
      {/* Elegantly placed ambient highlights */}
      <div className="absolute top-[-25%] left-[-20%] w-[700px] h-[700px] rounded-full bg-[#a68b6a]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#a68b6a]/5 blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        <AnimatePresence mode="wait">
          {!submittedSuccess ? (
            <motion.div
              key="rsvp-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/90 backdrop-blur-lg rounded-3xl border border-[#a68b6a]/20 shadow-[0_20px_50px_rgba(166,139,106,0.1)] overflow-hidden"
            >
              {/* Gold Top Border & Branding Accent */}
              <div className="h-2 bg-gradient-to-r from-[#bca374] via-[#a68b6a] to-[#bca374]" />
              
              <div className="p-6 sm:p-8">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#a68b6a]/15 text-[#a68b6a] mb-3">
                    <Heart className="h-5 w-5 fill-[#a68b6a]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                    Wedding Celebration
                  </h1>
                  <p className="mt-1.5 text-xs tracking-widest text-[#a68b6a] font-semibold uppercase font-[family-name:var(--font-plus-jakarta)]">
                    You Are Cordially Invited
                  </p>
                </div>

                {/* Invite greeting */}
                <div className="bg-[#a68b6a]/5 rounded-2xl p-5 border border-[#a68b6a]/10 text-center mb-6">
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">Dear</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mt-0.5">
                    {guest?.name}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 font-medium font-[family-name:var(--font-plus-jakarta)]">
                    Please RSVP by completing your contact & attendance preferences below.
                  </p>
                </div>

                {/* Main RSVP Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* RSVP Choice Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)] mb-2.5">
                      Your Attendance *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Attending */}
                      <button
                        type="button"
                        onClick={() => setRsvpStatus("attending")}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          rsvpStatus === "attending"
                            ? "bg-[#a68b6a]/10 border-[#a68b6a] shadow-md text-[#a68b6a]"
                            : "bg-white border-neutral-100 text-neutral-500 hover:border-[#a68b6a]/30 hover:bg-[#a68b6a]/5"
                        }`}
                      >
                        <span className="text-2xl mb-1">🥂</span>
                        <span className="text-sm font-bold font-[family-name:var(--font-plus-jakarta)]">Accepts With Pleasure</span>
                      </button>

                      {/* Declined */}
                      <button
                        type="button"
                        onClick={() => setRsvpStatus("declined")}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          rsvpStatus === "declined"
                            ? "bg-rose-50 border-rose-400 shadow-md text-rose-700"
                            : "bg-white border-neutral-100 text-neutral-500 hover:border-rose-300/40 hover:bg-rose-50/30"
                        }`}
                      >
                        <span className="text-2xl mb-1">✉️</span>
                        <span className="text-sm font-bold font-[family-name:var(--font-plus-jakarta)]">Declines With Regret</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)] mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-[#a68b6a] focus:ring-2 focus:ring-[#a68b6a]/15 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)] mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                          <Phone className="h-4 w-4" />
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 0917-XXX-XXXX"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-[#a68b6a] focus:ring-2 focus:ring-[#a68b6a]/15 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    {/* Dietary Requirements */}
                    {rsvpStatus === "attending" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1.5"
                      >
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                          Dietary Preferences / Food Allergies
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                            <Utensils className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={dietary}
                            onChange={(e) => setDietary(e.target.value)}
                            placeholder="e.g. Vegetarian, No Seafood, Gluten Free"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-[#a68b6a] focus:ring-2 focus:ring-[#a68b6a]/15 text-sm font-medium transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Seating Arrangement Notification */}
                  {rsvpStatus === "attending" && guest?.tableName && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3.5 rounded-xl border border-[#a68b6a]/20 bg-[#a68b6a]/5 flex items-start gap-3"
                    >
                      <MapPin className="h-5 w-5 text-[#a68b6a] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">
                          Your Reception Seating
                        </h4>
                        <p className="text-xs text-neutral-500 font-medium font-[family-name:var(--font-plus-jakarta)] mt-0.5">
                          You have been happily assigned to: <strong className="text-[#a68b6a]">{guest.tableName}</strong>.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingRsvp || !rsvpStatus}
                    className="w-full py-3 bg-[#a68b6a] text-white font-semibold rounded-xl hover:bg-[#957a5c] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingRsvp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting response...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Invitation RSVP</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => router.push("/rsvp/simulate")}
                      className="text-xs text-[#a68b6a] hover:text-[#957a5c] font-medium font-[family-name:var(--font-plus-jakarta)] hover:underline"
                    >
                      ← Back to Guest Simulator List
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/95 backdrop-blur-lg rounded-3xl border border-[#a68b6a]/20 shadow-[0_20px_50px_rgba(166,139,106,0.1)] p-8 text-center"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                Response Received!
              </h2>
              <p className="mt-2 text-sm text-neutral-500 font-[family-name:var(--font-plus-jakarta)] max-w-sm mx-auto leading-relaxed">
                Thank you for submitting your RSVP details. Your response has been securely saved and synchronized in the wedding planner's guest directory in real time.
              </p>

              {/* Seating recap */}
              {rsvpStatus === "attending" && (
                <div className="mt-6 p-4 rounded-2xl border border-black/5 bg-[#fafbf9] max-w-xs mx-auto">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                    Attending Confirmation
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                    {guest?.name}
                  </p>
                  {guest?.tableName ? (
                    <p className="mt-2 text-xs text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
                      Table: <span className="text-[#a68b6a] font-bold">{guest.tableName}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-400 font-[family-name:var(--font-plus-jakarta)]">
                      Seating charts will be shared soon.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="w-full py-2.5 border border-[#a68b6a]/30 text-[#a68b6a] hover:bg-[#a68b6a]/5 font-semibold rounded-xl text-sm transition-all"
                >
                  Edit Response
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/rsvp/simulate")}
                  className="w-full py-2.5 bg-[#a68b6a] text-white hover:bg-[#957a5c] font-semibold rounded-xl text-sm shadow-md transition-all"
                >
                  Return to RSVP Simulator List
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RSVPSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a68b6a]"></div>
      </div>
    }>
      <RSVPSimulatorContent />
    </Suspense>
  );
}
