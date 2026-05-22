"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BudgetItem } from "../types";

interface BudgetPlannerProps {
  items: BudgetItem[];
  onAdd: (item: Omit<BudgetItem, "id">) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  "Venue & Catering",
  "Photography & Videography",
  "Wedding Apparel",
  "Rings & Jewelry",
  "Decor & Flowers",
  "Planner & Coordination",
  "Entertainment & Music",
  "Invitations & Stationery",
  "Hair & Makeup",
  "Other",
];

export default function BudgetPlanner({ items, onAdd, onToggleStatus, onDelete }: BudgetPlannerProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState("");
  const [estimated, setEstimated] = useState("");
  const [actual, setActual] = useState("");
  const [notes, setNotes] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      category,
      name: name.trim(),
      estimated: parseFloat(estimated) || 0,
      actual: parseFloat(actual) || 0,
      status: "pending",
      notes: notes.trim(),
    });
    setName("");
    setEstimated("");
    setActual("");
    setNotes("");
  };

  const totalEstimated = items.reduce((acc, item) => acc + item.estimated, 0);
  const totalActual = items.reduce((acc, item) => acc + item.actual, 0);
  const totalPaid = items.reduce((acc, item) => acc + (item.status === "paid" ? item.actual : 0), 0);
  const totalPending = items.reduce((acc, item) => acc + (item.status === "pending" ? item.actual : 0), 0);

  const filteredItems = filterCategory === "All" ? items : items.filter((i) => i.category === filterCategory);

  const progressPercentage = totalEstimated > 0 ? Math.min((totalActual / totalEstimated) * 100, 100) : 0;
  const paidPercentage = totalActual > 0 ? Math.min((totalPaid / totalActual) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Analytics Card */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
            Budget Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-[18px] sm:text-[20px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">
                ₱{totalEstimated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">Actual Cost</span>
              <span className={`text-[18px] sm:text-[20px] font-bold font-[family-name:var(--font-plus-jakarta)] ${totalActual > totalEstimated && totalEstimated > 0 ? "text-red-500" : "text-neutral-700"}`}>
                ₱{totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">Paid Payments</span>
              <span className="text-[18px] sm:text-[20px] font-bold text-emerald-600 font-[family-name:var(--font-plus-jakarta)]">
                ₱{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">Pending / Outstanding</span>
              <span className="text-[18px] sm:text-[20px] font-bold text-amber-600 font-[family-name:var(--font-plus-jakarta)]">
                ₱{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[12px] font-semibold text-neutral-600 mb-1">
                <span>Budget Spent Gauge</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressPercentage > 90 ? "bg-red-400" : "bg-[#a68b6a]"}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-semibold text-neutral-600 mb-1">
                <span>Paid Ratio</span>
                <span>{paidPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Expenses Form */}
        <div className="w-full md:w-[350px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
            Add Expense
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
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

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Hall Downpayment"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Estimated (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Actual (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Venue coordinator is Jessica"
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
            >
              Add Expense
            </button>
          </form>
        </div>
      </div>

      {/* Expense Listing */}
      <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
            Expense Details
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-neutral-500">Filter Category:</span>
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
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[13px] text-neutral-400">No expenses recorded for this selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.04] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Expense Item</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4 text-right">Estimated</th>
                  <th className="pb-3 pr-4 text-right">Actual</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02] text-[13px]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-[#faf9f6]/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-neutral-800">{item.name}</div>
                      {item.notes && <div className="text-[11px] text-neutral-400 mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="py-3.5 pr-4 text-neutral-500 font-medium">{item.category}</td>
                    <td className="py-3.5 pr-4 text-right font-medium text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
                      ₱{item.estimated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-semibold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">
                      ₱{item.actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <button
                        onClick={() => onToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border cursor-pointer select-none transition-all duration-200 ${
                          item.status === "paid"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100/50"
                            : "bg-amber-50 text-amber-600 border-amber-200/50 hover:bg-amber-100/50"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === "paid" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {item.status}
                      </button>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
