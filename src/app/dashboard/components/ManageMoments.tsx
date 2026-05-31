"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { Sparkles, Eye, EyeOff, Edit3, Trash2, Globe, Lock, Users, Save, X, Plus } from "lucide-react";

interface MomentPhoto {
  id: string;
  image_url: string;
  caption: string | null;
}

interface Moment {
  id: string;
  title: string;
  moment_type: "photo" | "review" | "story" | "milestone";
  content: string | null;
  created_at: string;
  visibility: "public" | "private" | "friends";
  moment_photos?: MomentPhoto[];
}

interface ManageMomentsProps {
  userId: string;
  supabase: any;
}

export default function ManageMoments({ userId, supabase }: ManageMomentsProps) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inline editing states
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState<"public" | "private" | "friends">("private");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Inline delete confirm states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMoments();
  }, [userId]);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const res = await fetch("/api/moments?visibility=private", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.moments) {
        setMoments(data.moments);
      }
    } catch (err) {
      console.error("Error loading moments:", err);
      toast.error("Failed to load moments feed.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (moment: Moment) => {
    setEditingMomentId(moment.id);
    setEditTitle(moment.title);
    setEditContent(moment.content || "");
    setEditVisibility(moment.visibility);
  };

  const handleCancelEdit = () => {
    setEditingMomentId(null);
  };

  const handleSaveEdit = async (momentId: string) => {
    if (!editTitle.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    setSavingId(momentId);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`/api/moments/${momentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          visibility: editVisibility,
        }),
      });

      if (res.ok) {
        setMoments((prev) =>
          prev.map((m) =>
            m.id === momentId
              ? { ...m, title: editTitle, content: editContent, visibility: editVisibility }
              : m
          )
        );
        toast.success("Moment updated successfully!");
        setEditingMomentId(null);
      } else {
        throw new Error("Failed to update moment.");
      }
    } catch (err) {
      console.error("Error saving moment changes:", err);
      toast.error("Failed to save changes.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteConfirm = async (momentId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`/api/moments/${momentId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMoments((prev) => prev.filter((m) => m.id !== momentId));
        toast.success("Moment deleted successfully.");
        setDeletingId(null);
      } else {
        throw new Error("Failed to delete moment.");
      }
    } catch (err) {
      console.error("Error deleting moment:", err);
      toast.error("Failed to delete moment.");
    }
  };

  const getVisibilityIcon = (vis: "public" | "private" | "friends") => {
    switch (vis) {
      case "public":
        return <Globe size={13} className="text-emerald-500" />;
      case "friends":
        return <Users size={13} className="text-blue-500" />;
      case "private":
        return <Lock size={13} className="text-neutral-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 font-[family-name:var(--font-plus-jakarta)]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#a68b6a]"></div>
        <p className="text-xs text-neutral-400 font-medium">Loading your moments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/[0.04] pb-4">
        <div>
          <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
            Wedding Moments Manager
          </h2>
          <p className="text-xs text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-0.5">
            Create, edit, and organize public stories or private memories for your wedding page feed.
          </p>
        </div>

        <a
          href="/moments/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white bg-[#a68b6a] hover:bg-[#957a5c] rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)] cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Moment</span>
        </a>
      </div>

      {moments.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-12 text-center max-w-md mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#a68b6a]/10 flex items-center justify-center text-[#a68b6a] mx-auto shadow-inner">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">No moments created yet</h4>
            <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1 max-w-xs mx-auto leading-relaxed">
              Start documenting your wedding planning journey! Share photos, reviews, or milestones with your guests.
            </p>
          </div>
          <a
            href="/moments/create"
            className="inline-block px-5 py-2 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Create Your First Moment
          </a>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {moments.map((moment) => {
            const isEditing = editingMomentId === moment.id;
            const isDeleting = deletingId === moment.id;
            const hasPhotos = moment.moment_photos && moment.moment_photos.length > 0;

            return (
              <div
                key={moment.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md ${
                  isEditing ? "border-[#a68b6a] ring-1 ring-[#a68b6a]/30" : "border-black/5"
                }`}
              >
                {/* Photo Thumbnail Header if photos exist */}
                {hasPhotos && !isEditing && (
                  <div className="aspect-[21/9] bg-neutral-100 relative overflow-hidden select-none border-b border-black/[0.03]">
                    <img
                      src={moment.moment_photos![0].image_url}
                      alt={moment.title}
                      className="w-full h-full object-cover filter brightness-95"
                    />
                    {moment.moment_photos!.length > 1 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
                        + {moment.moment_photos!.length - 1} Photos
                      </span>
                    )}
                  </div>
                )}

                {/* Edit Form or View Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Moment Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full h-9 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                          placeholder="Proposal Lakeside..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Story Content
                        </label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                          placeholder="Describe the moment..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Visibility Setting
                        </label>
                        <select
                          value={editVisibility}
                          onChange={(e) => setEditVisibility(e.target.value as any)}
                          className="w-full h-9 px-2 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                        >
                          <option value="private">Private (Only You)</option>
                          <option value="public">Public (Everyone)</option>
                          <option value="friends">Friends & Guests</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-50 border border-neutral-100 rounded text-[9px] font-bold text-neutral-500 uppercase tracking-wider capitalize">
                          {moment.moment_type}
                        </span>
                        <div
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neutral-50 border border-neutral-100"
                          title={`Visibility: ${moment.visibility}`}
                        >
                          {getVisibilityIcon(moment.visibility)}
                          <span className="text-neutral-400 capitalize">{moment.visibility}</span>
                        </div>
                      </div>

                      <h3 className="text-[14px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)] line-clamp-1 leading-tight">
                        {moment.title}
                      </h3>

                      {moment.content && (
                        <p className="text-[12px] text-neutral-500 line-clamp-3 leading-relaxed font-[family-name:var(--font-plus-jakarta)]">
                          {moment.content}
                        </p>
                      )}

                      <span className="text-[10px] text-neutral-400 font-semibold block pt-2">
                        Added {new Date(moment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Controls Panel */}
                <div className="px-5 pb-5 pt-2 border-t border-black/[0.02] flex items-center justify-between select-none">
                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleSaveEdit(moment.id)}
                        disabled={savingId === moment.id}
                        className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                      >
                        <Save size={12} />
                        <span>{savingId === moment.id ? "Saving..." : "Save"}</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingId === moment.id}
                        className="flex-1 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-black/5 text-neutral-500 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                      >
                        <X size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : isDeleting ? (
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider animate-pulse shrink-0">Confirm Delete?</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDeleteConfirm(moment.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black/5 text-neutral-500 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => handleStartEdit(moment)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-[#a68b6a] transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>Edit Moment</span>
                      </button>

                      <button
                        onClick={() => setDeletingId(moment.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
