"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Calendar, MapPin, ExternalLink, Image as ImageIcon, Plus, Trash2, Edit3, X, Check } from "lucide-react";

interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  venue: string;
  venue_address: string | null;
  venue_map_url: string | null;
  image_url: string | null;
  registration_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}

export default function SuperadminEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  
  // Modals / Forms States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    venue: "",
    venue_address: "",
    venue_map_url: "",
    image_url: "",
    registration_url: "",
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await apiFetch<{ events: EventItem[] }>("/api/admin/events");
      setEvents(res.events ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        (ev.description && ev.description.toLowerCase().includes(q))
    );
  }, [events, search]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      venue: "",
      venue_address: "",
      venue_map_url: "",
      image_url: "",
      registration_url: "",
      is_featured: false,
      is_active: true
    });
  };

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (!formData.start_date) {
      toast.error("Start date is required.");
      return;
    }
    if (!formData.venue.trim()) {
      toast.error("Venue is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; event: EventItem }>("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Event added successfully.");
      setEvents((prev) => [res.event, ...prev]);
      resetForm();
      setShowAddForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;

    if (!formData.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (!formData.start_date) {
      toast.error("Start date is required.");
      return;
    }
    if (!formData.venue.trim()) {
      toast.error("Venue is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; event: EventItem }>("/api/admin/events", {
        method: "PATCH",
        body: JSON.stringify({ id: editingEvent.id, ...formData }),
      });
      toast.success("Event updated successfully.");
      setEvents((prev) => prev.map((ev) => (ev.id === editingEvent.id ? res.event : ev)));
      resetForm();
      setEditingEvent(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent(id: number) {
    setDeletingId(id);
    try {
      await apiFetch<{ success: boolean }>(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });
      toast.success("Event deleted successfully.");
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setEventToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleStatus(event: EventItem, key: "is_active" | "is_featured") {
    const nextVal = !event[key];
    try {
      const res = await apiFetch<{ success: boolean; event: EventItem }>("/api/admin/events", {
        method: "PATCH",
        body: JSON.stringify({ id: event.id, [key]: nextVal }),
      });
      setEvents((prev) => prev.map((ev) => (ev.id === event.id ? res.event : ev)));
      toast.success(`${key === "is_active" ? "Visibility" : "Feature status"} updated.`);
    } catch (e) {
      toast.error("Failed to toggle event status.");
    }
  }

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description ?? "",
      start_date: event.start_date ? event.start_date.split("T")[0] : "",
      end_date: event.end_date ? event.end_date.split("T")[0] : "",
      venue: event.venue,
      venue_address: event.venue_address ?? "",
      venue_map_url: event.venue_map_url ?? "",
      image_url: event.image_url ?? "",
      registration_url: event.registration_url ?? "",
      is_featured: event.is_featured,
      is_active: event.is_active
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-[#2c2c2c] tracking-[-0.01em]">Events Banners</h1>
            <p className="text-[12px] text-black/45 mt-1 font-medium">
              Manage bridal fairs and promotional events to show in the dynamic Sponsored Ads Banners.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="h-10 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6a46] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Event</span>
            </button>
            <button
              onClick={loadEvents}
              className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search bar */}
          <div className="mb-6 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or venue..."
              className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            />
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-[3px] border border-black/10 bg-white animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-black/10 rounded-[3px] bg-black/[0.01]">
              <ImageIcon className="mx-auto text-black/20 mb-3" size={32} />
              <p className="text-[13px] font-medium text-black/55">No events found</p>
              <p className="text-[11px] text-black/35 mt-1">Create a new bridal fair to display on the sponsored banners feed.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#a67c52]/40 transition-all duration-300 group"
                >
                  <div>
                    {/* Cover photo preview */}
                    <div className="h-32 w-full bg-neutral-100 relative overflow-hidden shrink-0 border-b border-black/5">
                      {ev.image_url ? (
                        <img src={ev.image_url} alt={ev.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      {ev.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm">
                          ★ Featured
                        </span>
                      )}
                      
                      {/* Status Badges */}
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm border ${
                        ev.is_active
                          ? "bg-green-500 text-white border-green-400"
                          : "bg-neutral-500 text-white border-neutral-400"
                      }`}>
                        {ev.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2c2c2c] line-clamp-1 leading-snug">{ev.title}</h3>
                        <p className="text-[11px] text-black/40 font-mono mt-0.5">/{ev.slug}</p>
                      </div>

                      {ev.description && (
                        <p className="text-[12px] text-black/55 line-clamp-2 leading-relaxed h-8">
                          {ev.description}
                        </p>
                      )}

                      <div className="space-y-1.5 pt-2 border-t border-black/5 text-[11px] text-black/60 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#a67c52]" />
                          <span>
                            {formatDate(ev.start_date)}
                            {ev.end_date && ev.end_date !== ev.start_date && ` - ${formatDate(ev.end_date)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#a67c52]" />
                          <span className="truncate" title={ev.venue_address || ev.venue}>
                            {ev.venue}
                          </span>
                        </div>
                        {ev.registration_url && (
                          <div className="flex items-center gap-1.5 text-[#a67c52] hover:underline">
                            <ExternalLink size={13} />
                            <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" className="truncate">
                              {ev.registration_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-4 py-3 bg-[#fafafa] border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(ev, "is_active")}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          ev.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                        title="Toggle visibility"
                      >
                        {ev.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => toggleStatus(ev, "is_featured")}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          ev.is_featured
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {ev.is_featured ? "Unfeature" : "Feature"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setEventToDelete(ev)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#2c2c2c]">Create Event Banner</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded hover:bg-black/5 text-neutral-400 hover:text-neutral-600 transition-all font-bold cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="p-5 max-h-[70vh] overflow-y-auto grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Event Title</span>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="e.g. Grand Bridal Fair 2026"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="p-2 rounded-[3px] border border-black/10 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="Provide a compelling offer details or program summary..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Start Date</span>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">End Date (Optional)</span>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Name</span>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="e.g. Marriott Grand Ballroom"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Cover Image URL</span>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Full Address</span>
                  <input
                    type="text"
                    value={formData.venue_address}
                    onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="e.g. 2 Resort Drive, Pasay City"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Map Embed/URL</span>
                  <input
                    type="text"
                    value={formData.venue_map_url}
                    onChange={(e) => setFormData({ ...formData, venue_map_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="Google Map Link..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">CTA/Registration Link</span>
                  <input
                    type="text"
                    value={formData.registration_url}
                    onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                    placeholder="e.g. /vendors or externallink..."
                  />
                </label>

                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 select-none cursor-pointer p-2.5 rounded border border-black/5 bg-black/[0.01]">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                    />
                    <div className="grid">
                      <span className="text-[11px] font-bold text-neutral-700">Featured Event</span>
                      <span className="text-[9px] text-neutral-400">Displays star badge.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 select-none cursor-pointer p-2.5 rounded border border-black/5 bg-black/[0.01]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                    />
                    <div className="grid">
                      <span className="text-[11px] font-bold text-neutral-700">Published (Active)</span>
                      <span className="text-[9px] text-neutral-400">Visibly rotating in the ads banner.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-[#fafafa]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-9 px-4 rounded-[3px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#2c2c2c]">Edit Event Banner</h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5">ID: {editingEvent.id}</p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded hover:bg-black/5 text-neutral-400 hover:text-neutral-600 transition-all font-bold cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditEvent}>
              <div className="p-5 max-h-[70vh] overflow-y-auto grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Event Title</span>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="p-2 rounded-[3px] border border-black/10 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Start Date</span>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">End Date (Optional)</span>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Name</span>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Cover Image URL</span>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Full Address</span>
                  <input
                    type="text"
                    value={formData.venue_address}
                    onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">Venue Map Embed/URL</span>
                  <input
                    type="text"
                    value={formData.venue_map_url}
                    onChange={(e) => setFormData({ ...formData, venue_map_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-bold text-black/55 uppercase tracking-wider">CTA/Registration Link</span>
                  <input
                    type="text"
                    value={formData.registration_url}
                    onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                    className="h-10 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>

                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 select-none cursor-pointer p-2.5 rounded border border-black/5 bg-black/[0.01]">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                    />
                    <div className="grid">
                      <span className="text-[11px] font-bold text-neutral-700">Featured Event</span>
                      <span className="text-[9px] text-neutral-400">Displays star badge.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 select-none cursor-pointer p-2.5 rounded border border-black/5 bg-black/[0.01]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                    />
                    <div className="grid">
                      <span className="text-[11px] font-bold text-neutral-700">Published (Active)</span>
                      <span className="text-[9px] text-neutral-400">Visibly rotating in the ads banner.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-[#fafafa]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="h-9 px-4 rounded-[3px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-black/10">
              <h2 className="text-[14px] font-semibold text-[#2c2c2c]">Delete Event</h2>
              <p className="mt-1 text-[11.5px] text-black/50 leading-relaxed font-medium">
                Are you sure you want to delete this event banner? This action will permanently remove it and cannot be undone.
              </p>
            </div>
            <div className="px-5 py-4 bg-[#fafafa] border-b border-black/5 text-[12px]">
              <div className="font-bold text-neutral-800 line-clamp-1">{eventToDelete.title}</div>
              <div className="text-[10px] text-black/40 font-mono mt-1">/{eventToDelete.slug}</div>
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => setEventToDelete(null)}
                className="h-9 px-4 rounded-[3px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => handleDeleteEvent(eventToDelete.id)}
                className="h-9 px-4 rounded-[3px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60 cursor-pointer"
              >
                {deletingId !== null ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
