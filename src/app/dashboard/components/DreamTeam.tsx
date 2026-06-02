"use client";

import { useState } from "react";
import { Trash2, CheckCircle2, Mail, Compass, Star, Phone, Edit2, X } from "lucide-react";
import { DreamVendor } from "../types";

interface DreamTeamProps {
  vendors: DreamVendor[];
  onAddVendor: (vendor: Omit<DreamVendor, "id">) => void;
  onUpdateStatus: (id: string, status: DreamVendor["status"]) => void;
  onDeleteVendor: (id: string) => void;
  onUpdateVendor?: (id: string, vendor: Omit<DreamVendor, "id">) => void;
  onNavigateToTab?: (tabId: string, vendorName?: string) => void;
  savedVendors?: any[];
}

const CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Wedding Dress & Suit",
  "Hair & Makeup",
  "Flowers & Decor",
  "Planner & Coordinator",
  "Band & Entertainment",
  "Invitations",
  "Lights & Sound",
  "Cake & Desserts",
  "Other",
];

export default function DreamTeam({
  vendors,
  onAddVendor,
  onUpdateStatus,
  onDeleteVendor,
  onUpdateVendor,
  onNavigateToTab,
  savedVendors = [],
}: DreamTeamProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState("5");
  const [status, setStatus] = useState<DreamVendor["status"]>("prospect");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  // Editing State
  const [editingVendor, setEditingVendor] = useState<DreamVendor | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const vendorData = {
      name: name.trim(),
      category,
      rating: parseInt(rating) || 5,
      status,
      contact: contact.trim(),
      notes: notes.trim(),
    };

    if (editingVendor) {
      if (onUpdateVendor) {
        onUpdateVendor(editingVendor.id, vendorData);
      }
      setEditingVendor(null);
    } else {
      onAddVendor(vendorData);
    }

    setName("");
    setContact("");
    setNotes("");
    setCategory(CATEGORIES[0]);
    setRating("5");
    setStatus("prospect");
  };

  const handleStartEdit = (vendor: DreamVendor) => {
    setEditingVendor(vendor);
    setName(vendor.name);
    setCategory(vendor.category);
    setRating(vendor.rating.toString());
    setStatus(vendor.status);
    setContact(vendor.contact || "");
    setNotes(vendor.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    setName("");
    setCategory(CATEGORIES[0]);
    setRating("5");
    setStatus("prospect");
    setContact("");
    setNotes("");
  };

  const total = vendors.length;
  const booked = vendors.filter((v) => v.status === "booked").length;
  const inquired = vendors.filter((v) => v.status === "inquired").length;
  const prospect = vendors.filter((v) => v.status === "prospect").length;

  return (
    <div className="space-y-6">
      {/* Dream Team Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Dream Suppliers</span>
            <Compass size={14} className="text-neutral-400" />
          </div>
          <span className="text-[24px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">{total}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Booked</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <span className="text-[24px] font-bold text-emerald-600 font-[family-name:var(--font-plus-jakarta)]">{booked}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Inquired</span>
            <Mail size={14} className="text-[#a68b6a]" />
          </div>
          <span className="text-[24px] font-bold text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)]">{inquired}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Prospects</span>
            <Star size={14} className="text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[24px] font-bold text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">{prospect}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Vendor Form */}
        <div className="w-full lg:w-[350px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm self-start">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              {editingVendor ? "Edit Supplier Track" : "Add Supplier Track"}
            </h3>
            {editingVendor && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg cursor-pointer"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {savedVendors.length === 0 && (
              <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 text-[11px] text-[#6e4f33] leading-relaxed select-none mb-2">
                <div className="mb-2">
                  💡 <strong>Instruction:</strong> Please browse suppliers and save a vendor first. Only saved vendors can be added to your Dream Supplier Team.
                </div>
                <a
                  href="/suppliers"
                  className="inline-flex items-center justify-center px-2.5 py-1 bg-[#a68b6a] text-white hover:bg-[#957a5c] rounded text-[10px] font-bold transition-colors uppercase tracking-wider"
                >
                  Browse Suppliers →
                </a>
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Supplier / Business Name</label>
              {editingVendor ? (
                <input
                  type="text"
                  disabled
                  value={name}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-neutral-50 px-3 text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]"
                />
              ) : (
                <div className="space-y-1">
                  <select
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                  >
                    <option value="">-- Select a Saved Vendor --</option>
                    {savedVendors.map((sv) => (
                      <option key={sv.vendor.id} value={sv.vendor.business_name}>
                        {sv.vendor.business_name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end">
                    <a
                      href="/suppliers"
                      className="text-[10px] text-[#a68b6a] hover:underline font-bold tracking-tight inline-flex items-center gap-0.5"
                    >
                      Browse & save more suppliers →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DreamVendor["status"])}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                >
                  <option value="prospect">Prospect</option>
                  <option value="inquired">Inquired</option>
                  <option value="booked">Booked</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Very Good)</option>
                  <option value="3">3 Stars (Good)</option>
                  <option value="2">2 Stars (Fair)</option>
                  <option value="1">1 Star (Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Contact (Email or Phone)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. +63917... or supplier@mail.com"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Private Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Package includes full catering, host, sound system setup"
                rows={3}
                className="w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 p-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div className="flex gap-2">
              {editingVendor && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
              >
                {editingVendor ? "Save" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>

        {/* Suppliers Registry Card */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-6 pb-2 border-b border-black/[0.04]">
            My Supplier Tracker
          </h3>

          {vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-neutral-400">Your dream supplier tracker is empty. Add a supplier to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="rounded-xl border border-black/5 bg-[#fafafa]/40 p-4 hover:shadow-md hover:border-neutral-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] truncate max-w-[180px]">
                          {vendor.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider mt-0.5">
                          {vendor.category}
                        </span>
                      </div>
                      
                      {/* Status select drop down */}
                      <select
                        value={vendor.status}
                        onChange={(e) => onUpdateStatus(vendor.id, e.target.value as DreamVendor["status"])}
                        className={`h-7 rounded px-1.5 text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                          vendor.status === "booked"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : vendor.status === "inquired"
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-neutral-100 text-neutral-500 border-neutral-300"
                        }`}
                      >
                        <option value="prospect">Prospect</option>
                        <option value="inquired">Inquired</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>

                    <div className="flex gap-0.5 text-[#a68b6a] mb-2.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < vendor.rating ? "fill-[#a68b6a] text-[#a68b6a]" : "text-neutral-200 fill-transparent"}
                        />
                      ))}
                    </div>

                    {vendor.contact && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold mb-2">
                        <Phone size={12} className="text-neutral-400" />
                        <span>{vendor.contact}</span>
                      </div>
                    )}

                    {vendor.notes && (
                      <p className="text-[11px] text-neutral-400 bg-white p-2 rounded border border-black/[0.03] italic leading-relaxed">
                        "{vendor.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4 pt-2 border-t border-black/[0.03]">
                    <button
                      onClick={() => onNavigateToTab?.("rants_reviews", vendor.name)}
                      className="p-1 text-[#a68b6a] hover:underline rounded transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold mr-auto"
                      title="Write or view private journal entry for this supplier"
                    >
                      <span>Journal Log</span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(vendor)}
                      className="p-1 text-neutral-400 hover:text-[#a68b6a] rounded transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      title="Edit supplier details"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteVendor(vendor.id)}
                      className="p-1 text-neutral-400 hover:text-red-500 rounded transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      title="Remove supplier"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
