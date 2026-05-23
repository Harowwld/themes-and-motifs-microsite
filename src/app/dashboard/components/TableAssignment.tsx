"use client";

import { useState } from "react";
import { Trash2, X, Edit2 } from "lucide-react";
import { Guest, WeddingTable } from "../types";
import { toast } from "@/lib/toast";

interface TableAssignmentProps {
  guests: Guest[];
  tables: WeddingTable[];
  onAddTable: (table: Omit<WeddingTable, "id">) => void;
  onDeleteTable: (id: string) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
  onUpdateTable?: (id: string, name: string, capacity: number) => void;
}

export default function TableAssignment({
  guests,
  tables,
  onAddTable,
  onDeleteTable,
  onAssignGuest,
  onUpdateTable,
}: TableAssignmentProps) {
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("8");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Table Editing States
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [editTableName, setEditTableName] = useState("");
  const [editCapacity, setEditCapacity] = useState("8");

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;
    onAddTable({
      name: tableName.trim(),
      capacity: parseInt(capacity) || 8,
    });
    setTableName("");
    setCapacity("8");
    toast.success("Seating table added!");
  };

  const handleAssign = (guestId: string, tableId: string | null) => {
    if (tableId) {
      const table = tables.find((t) => t.id === tableId);
      const assignedCount = guests.filter((g) => g.tableId === tableId).length;
      if (table && assignedCount >= table.capacity) {
        toast.error(`Table "${table.name}" has reached its maximum capacity of ${table.capacity} guests.`);
        return;
      }
    }
    onAssignGuest(guestId, tableId);
    toast.success(tableId ? "Guest assigned to table!" : "Guest unassigned.");
  };

  const startEditingTable = () => {
    if (selectedTable) {
      setEditTableName(selectedTable.name);
      setEditCapacity(selectedTable.capacity.toString());
      setIsEditingTable(true);
    }
  };

  const handleSaveTableEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !onUpdateTable) return;
    if (!editTableName.trim()) {
      toast.error("Table name cannot be empty.");
      return;
    }
    const newCapacity = parseInt(editCapacity) || 8;
    if (newCapacity < selectedTableGuests.length) {
      toast.error(`Capacity cannot be less than the number of currently seated guests (${selectedTableGuests.length}).`);
      return;
    }
    onUpdateTable(selectedTableId, editTableName.trim(), newCapacity);
    setIsEditingTable(false);
  };

  const unassignedGuests = guests.filter((g) => !g.tableId && g.rsvpStatus === "attending");
  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const selectedTableGuests = guests.filter((g) => g.tableId === selectedTableId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Seating Dashboard and Table Creator */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-black/[0.04] pb-4">
            <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Seating Arrangement Tables
            </h3>
            <span className="text-[12px] text-neutral-400 font-semibold uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
              {tables.length} Tables Total
            </span>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-neutral-400">No tables created yet. Add a table to begin seating guests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map((table) => {
                const assigned = guests.filter((g) => g.tableId === table.id);
                const isFull = assigned.length >= table.capacity;
                const isSelected = selectedTableId === table.id;

                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      setSelectedTableId(table.id);
                      setIsEditingTable(false);
                    }}
                    className={`relative p-5 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                      isSelected
                        ? "bg-[#a68b6a]/5 border-[#a68b6a] shadow-md ring-2 ring-[#a68b6a]/15"
                        : "bg-white border-black/5 hover:border-[#a68b6a]/50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                          {table.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider mt-0.5">
                          Capacity: {table.capacity} Seats
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedTableId === table.id) {
                            setSelectedTableId(null);
                            setIsEditingTable(false);
                          }
                          onDeleteTable(table.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Delete Table"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-neutral-600 mb-1">
                        <span>Seated Guests</span>
                        <span className={isFull ? "text-amber-600 font-bold" : ""}>
                          {assigned.length} / {table.capacity} Assigned
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? "bg-amber-500" : "bg-[#a68b6a]"
                          }`}
                          style={{ width: `${(assigned.length / table.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Seating Administrator Controls */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-6">
          {/* Create Table Form */}
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
              Create Seating Table
            </h3>
            <form onSubmit={handleAddTable} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Table Name</label>
                <input
                  type="text"
                  required
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g. VIP Table 1, Friends Table A"
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Table Capacity</label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                >
                  <option value="4">4 Seats</option>
                  <option value="6">6 Seats</option>
                  <option value="8">8 Seats (Standard)</option>
                  <option value="10">10 Seats</option>
                  <option value="12">12 Seats</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
              >
                Create Table
              </button>
            </form>
          </div>

          {/* Seating Assignment Control Panel */}
          {selectedTableId && selectedTable ? (
            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              {isEditingTable ? (
                /* Inline Edit Table Form */
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-black/[0.04] pb-3">
                    <h3 className="text-[14px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                      Edit Table Details
                    </h3>
                    <button
                      onClick={() => setIsEditingTable(false)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                      title="Cancel Editing"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <form onSubmit={handleSaveTableEdit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 block mb-1">Table Name</label>
                      <input
                        type="text"
                        required
                        value={editTableName}
                        onChange={(e) => setEditTableName(e.target.value)}
                        placeholder="Table name"
                        className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 block mb-1">Table Capacity</label>
                      <select
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(e.target.value)}
                        className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                      >
                        <option value="4">4 Seats</option>
                        <option value="6">6 Seats</option>
                        <option value="8">8 Seats</option>
                        <option value="10">10 Seats</option>
                        <option value="12">12 Seats</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingTable(false)}
                        className="flex-1 h-9 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[12px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-9 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[12px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Standard Seating & Assignment View */
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-black/[0.04] pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                        Manage: {selectedTable.name}
                      </h3>
                      <button
                        onClick={startEditingTable}
                        className="p-1 text-neutral-400 hover:text-[#a68b6a] rounded-lg transition-colors"
                        title="Edit Table Name & Capacity"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      {selectedTableGuests.length} seated
                    </span>
                  </div>

                  {/* Assign Unassigned Attending Guest */}
                  <div className="mb-6">
                    <label className="text-[11px] font-bold text-neutral-500 block mb-1.5">Assign Guest to Table</label>
                    {unassignedGuests.length === 0 ? (
                      <p className="text-[11px] text-[#a68b6a] italic font-medium font-[family-name:var(--font-plus-jakarta)]">No unassigned attending guests left.</p>
                    ) : (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssign(e.target.value, selectedTableId);
                            e.target.value = "";
                          }
                        }}
                        className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                      >
                        <option value="">-- Choose guest to seat here --</option>
                        {unassignedGuests.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.category})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Seated Guests List */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 block mb-2 uppercase tracking-wider">
                      Seated Guest List
                    </label>
                    {selectedTableGuests.length === 0 ? (
                      <p className="text-[11px] text-neutral-400 italic">No guests seated at this table yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTableGuests.map((g) => (
                          <div
                            key={g.id}
                            className="flex items-center justify-between bg-[#fafafa] border border-black/5 rounded-lg p-2 text-[12px] font-medium"
                          >
                            <span className="text-neutral-700 truncate">{g.name}</span>
                            <button
                              onClick={() => handleAssign(g.id, null)}
                              className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
                            >
                              Unseat
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/20 bg-neutral-50/50 p-6 text-center">
              <p className="text-[12px] text-neutral-400">Click a table on the left dashboard to manage its guest assignments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
