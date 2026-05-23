"use client";

import { useState } from "react";
import { Trash2, Edit2, X } from "lucide-react";
import { Guest, WeddingTable } from "../types";

interface GuestListProps {
  guests: Guest[];
  tables: WeddingTable[];
  onAdd: (guest: Omit<Guest, "id">) => void;
  onUpdateRSVP: (id: string, status: Guest["rsvpStatus"]) => void;
  onDelete: (id: string) => void;
  onUpdateGuest?: (id: string, guest: Omit<Guest, "id">) => void;
}

const CATEGORIES: Guest["category"][] = ["Family", "Friends", "Work", "Other"];

export default function GuestList({
  guests,
  tables,
  onAdd,
  onUpdateRSVP,
  onDelete,
  onUpdateGuest,
}: GuestListProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Guest["category"]>("Family");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietary, setDietary] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRSVP, setFilterRSVP] = useState("All");

  // Editing State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const guestData = {
      name: name.trim(),
      category,
      email: email.trim(),
      phone: phone.trim(),
      dietary: dietary.trim(),
    };

    if (editingGuest) {
      if (onUpdateGuest) {
        onUpdateGuest(editingGuest.id, {
          ...guestData,
          rsvpStatus: editingGuest.rsvpStatus,
          tableId: editingGuest.tableId,
        });
      }
      setEditingGuest(null);
    } else {
      onAdd({
        ...guestData,
        rsvpStatus: "pending",
        tableId: null,
      });
    }

    setName("");
    setEmail("");
    setPhone("");
    setDietary("");
  };

  const handleStartEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setName(guest.name);
    setCategory(guest.category);
    setEmail(guest.email || "");
    setPhone(guest.phone || "");
    setDietary(guest.dietary || "");
  };

  const handleCancelEdit = () => {
    setEditingGuest(null);
    setName("");
    setCategory("Family");
    setEmail("");
    setPhone("");
    setDietary("");
  };

  const total = guests.length;
  const attending = guests.filter((g) => g.rsvpStatus === "attending").length;
  const declined = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pending = guests.filter((g) => g.rsvpStatus === "pending").length;

  const filteredGuests = guests.filter((g) => {
    const matchesCat = filterCategory === "All" || g.category === filterCategory;
    const matchesRSVP = filterRSVP === "All" || g.rsvpStatus === filterRSVP;
    return matchesCat && matchesRSVP;
  });

  return (
    <div className="space-y-6">
      {/* RSVP Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Total Guests</span>
          <span className="text-[24px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">{total}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Attending</span>
          <span className="text-[24px] font-bold text-emerald-600 font-[family-name:var(--font-plus-jakarta)]">{attending}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Declined</span>
          <span className="text-[24px] font-bold text-red-500 font-[family-name:var(--font-plus-jakarta)]">{declined}</span>
        </div>
        <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Pending RSVP</span>
          <span className="text-[24px] font-bold text-amber-500 font-[family-name:var(--font-plus-jakarta)]">{pending}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Guest Form */}
        <div className="w-full lg:w-[350px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm self-start">
          <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
            Add New Guest
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guest["category"])}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. johndoe@gmail.com"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09171234567"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Dietary Requirements</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Vegan, Peanut allergy"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
            >
              Add Guest
            </button>
          </form>
        </div>

        {/* Guest Table */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Guest Registry
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-9 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[12px] font-medium outline-none focus:border-[#a68b6a]"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterRSVP}
                  onChange={(e) => setFilterRSVP(e.target.value)}
                  className="h-9 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[12px] font-medium outline-none focus:border-[#a68b6a]"
                >
                  <option value="All">All RSVPs</option>
                  <option value="pending">Pending</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-neutral-400">No guests found matching filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.04] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Contact Info</th>
                    <th className="pb-3 pr-4">Table</th>
                    <th className="pb-3 pr-4 text-center">RSVP</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.02] text-[13px]">
                  {filteredGuests.map((guest) => {
                    const assignedTable = tables.find((t) => t.id === guest.tableId);
                    return (
                      <tr key={guest.id} className="group hover:bg-[#faf9f6]/30 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-neutral-800">{guest.name}</div>
                          {guest.dietary && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100/50">
                              Dietary: {guest.dietary}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-neutral-500 font-medium">{guest.category}</td>
                        <td className="py-3.5 pr-4">
                          {guest.email && <div className="text-neutral-600 truncate max-w-[150px]">{guest.email}</div>}
                          {guest.phone && <div className="text-[11px] text-neutral-400 mt-0.5">{guest.phone}</div>}
                          {!guest.email && !guest.phone && <span className="text-neutral-300">-</span>}
                        </td>
                        <td className="py-3.5 pr-4 text-neutral-600 font-medium">
                          {assignedTable ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/50">
                              {assignedTable.name}
                            </span>
                          ) : (
                            <span className="text-neutral-300 text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-center">
                          <select
                            value={guest.rsvpStatus}
                            onChange={(e) => onUpdateRSVP(guest.id, e.target.value as Guest["rsvpStatus"])}
                            className={`h-7 rounded px-1.5 text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                              guest.rsvpStatus === "attending"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : guest.rsvpStatus === "declined"
                                ? "bg-red-50 text-red-500 border-red-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="attending">Attending</option>
                            <option value="declined">Declined</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onDelete(guest.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Delete guest"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
