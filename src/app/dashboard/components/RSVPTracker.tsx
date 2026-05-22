"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, Copy, CheckCircle } from "lucide-react";
import { Guest } from "../types";
import { toast } from "@/lib/toast";

interface RSVPTrackerProps {
  guests: Guest[];
  onUpdateRSVP: (id: string, status: Guest["rsvpStatus"]) => void;
}

export default function RSVPTracker({ guests, onUpdateRSVP }: RSVPTrackerProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (guestId: string) => {
    const mockLink = `${window.location.origin}/rsvp/simulate?guestId=${guestId}`;
    navigator.clipboard.writeText(mockLink);
    setCopiedId(guestId);
    toast.success("Guest custom RSVP link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const total = guests.length;
  const attending = guests.filter((g) => g.rsvpStatus === "attending").length;
  const declined = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pending = guests.filter((g) => g.rsvpStatus === "pending").length;

  const attendingPercent = total > 0 ? (attending / total) * 100 : 0;
  const declinedPercent = total > 0 ? (declined / total) * 100 : 0;
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;

  // Search through guests
  const filteredGuests = guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  // Extract dietary requirements
  const dietaryGuests = guests.filter((g) => g.dietary && g.rsvpStatus === "attending");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Stats and SVG Donut Chart */}
        <div className="bg-white border border-black/5 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4 self-start">
            RSVP Breakdown
          </h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1efe9" strokeWidth="3" />
              
              {/* Attending circle segment */}
              {attendingPercent > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${attendingPercent} ${100 - attendingPercent}`}
                  strokeDashoffset="0"
                />
              )}
              
              {/* Declined segment */}
              {declinedPercent > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray={`${declinedPercent} ${100 - declinedPercent}`}
                  strokeDashoffset={100 - attendingPercent}
                />
              )}
            </svg>
            <div className="absolute text-center">
              <span className="text-[28px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                {total > 0 ? `${((attending / total) * 100).toFixed(0)}%` : "0%"}
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold block uppercase tracking-wider">Attending</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 text-center text-[12px] font-medium mt-2">
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
              <span className="text-neutral-500">Yes ({attending})</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5" />
              <span className="text-neutral-500">No ({declined})</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
              <span className="text-neutral-500">Pending ({pending})</span>
            </div>
          </div>
        </div>

        {/* RSVP Link Generator & Simulator */}
        <div className="lg:col-span-2 bg-white border border-black/5 rounded-xl p-6 shadow-sm">
          <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-2">
            Simulate Guest RSVPs
          </h3>
          <p className="text-[12px] text-neutral-400 mb-4 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
            Copy custom RSVP links for each guest to send to them. Below you can simulate how their RSVP updates in real-time when they reply.
          </p>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search guest by name to get link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 border border-black/[0.03] rounded-lg p-2 bg-[#fafafa]">
            {filteredGuests.length === 0 ? (
              <p className="text-[12px] text-neutral-400 text-center py-4">No guests found.</p>
            ) : (
              filteredGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between bg-white border border-black/5 rounded-lg p-2.5 shadow-sm text-[12px]">
                  <div>
                    <span className="font-semibold text-neutral-800">{g.name}</span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded ml-2 font-bold uppercase tracking-wider">{g.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(g.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                        copiedId === g.id
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-white text-[#a68b6a] border-[#a68b6a]/30 hover:bg-[#a68b6a]/5"
                      }`}
                    >
                      {copiedId === g.id ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    
                    {/* Simulated quick response buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onUpdateRSVP(g.id, "attending");
                          toast.success(`${g.name} marked as attending!`);
                        }}
                        className="p-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50 hover:border-emerald-200 transition-colors inline-flex items-center gap-0.5 font-bold cursor-pointer"
                        title="Simulate Yes"
                      >
                        <Check size={12} strokeWidth={2.5} />
                        <span>Yes</span>
                      </button>
                      <button
                        onClick={() => {
                          onUpdateRSVP(g.id, "declined");
                          toast.success(`${g.name} marked as declined.`);
                        }}
                        className="p-1 px-2 rounded-md bg-red-50 hover:bg-red-100 text-red-500 border border-red-200/50 hover:border-red-200 transition-colors inline-flex items-center gap-0.5 font-bold cursor-pointer"
                        title="Simulate No"
                      >
                        <X size={12} strokeWidth={2.5} />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Attending Dietary Requirements Summary */}
      <div className="bg-white border border-black/5 rounded-xl p-6 shadow-sm">
        <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
          Dietary Requirements Checklist (Confirmed Guests)
        </h3>
        
        {dietaryGuests.length === 0 ? (
          <p className="text-[12px] text-neutral-400 text-center py-6">
            No confirmed attending guests have declared dietary requirements.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dietaryGuests.map((g) => (
              <div key={g.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-semibold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">{g.name}</h4>
                  <p className="text-[12px] text-red-600 font-bold font-[family-name:var(--font-plus-jakarta)] mt-0.5">{g.dietary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
