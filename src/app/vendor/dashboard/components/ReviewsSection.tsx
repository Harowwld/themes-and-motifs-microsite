import React, { useState } from "react";
import { Star, MessageCircle, Trash2, Edit3, X, Check, Loader2 } from "lucide-react";
import { Review } from "../types";

export function ReviewsSection({
  reviews,
  saving,
  saveReviewReply,
}: {
  reviews: Review[];
  saving: boolean;
  saveReviewReply: (reviewId: number, text: string | null) => Promise<any>;
}) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [draftReplyText, setDraftReplyText] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const handleStartReply = (review: Review) => {
    setEditingReviewId(review.id);
    setDraftReplyText(review.vendor_reply_text ?? "");
  };

  const handleCancelReply = () => {
    setEditingReviewId(null);
    setDraftReplyText("");
  };

  const handleSaveReply = async (reviewId: number) => {
    const trimmed = draftReplyText.trim();
    if (!trimmed) return;
    await saveReviewReply(reviewId, trimmed);
    setEditingReviewId(null);
    setDraftReplyText("");
  };

  const handleDeleteReply = (reviewId: number) => {
    setDeletingReviewId(reviewId);
  };

  const confirmDeleteReply = async (reviewId: number) => {
    await saveReviewReply(reviewId, null);
    setDeletingReviewId(null);
  };

  function maskEmail(email?: string | null) {
    if (!email) return "Verified Couple";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  }

  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Reviews & Responses</h2>
          <div className="mt-1 text-[12px] text-black/45">
            View couple ratings, feedback, and manage your official business responses.
          </div>
        </div>
      </div>

      <div className="p-6">
        {reviews.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
              <Star size={26} className="text-[#a67c52]" fill="#a67c52" />
            </div>
            <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">No reviews yet</div>
            <div className="text-[13px] text-black/40 max-w-xs mx-auto">
              When couples submit reviews and star ratings for your profile, they will appear here.
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((r) => {
              const isEditing = editingReviewId === r.id;
              const reviewerEmail = r.users?.[0]?.email ?? (r as any).users?.email ?? null;

              return (
                <div
                  key={r.id}
                  className="rounded-lg border border-black/[0.05] bg-white p-5 hover:border-black/[0.1] hover:shadow-md transition-all duration-300"
                >
                  {/* Review Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#a67c52]/10 flex items-center justify-center text-[#a67c52]">
                        <span className="text-[13px] font-bold">
                          {reviewerEmail ? reviewerEmail[0].toUpperCase() : "C"}
                        </span>
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#2c2c2c]">
                          {maskEmail(reviewerEmail)}
                        </div>
                        <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-0.5">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#a67c52]/[0.06] text-[13px] font-bold text-[#a67c52]">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={12}
                            fill={idx < r.rating ? "#a67c52" : "none"}
                            className={idx < r.rating ? "text-[#a67c52]" : "text-black/10"}
                          />
                        ))}
                      </div>
                      <span>{r.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  {r.review_text ? (
                    <div className="pl-1 text-[13px] leading-relaxed text-black/60 italic mb-4">
                      "{r.review_text}"
                    </div>
                  ) : (
                    <div className="pl-1 text-[12px] leading-relaxed text-black/30 italic mb-4">
                      No review text provided.
                    </div>
                  )}

                  {/* Vendor Reply Nesting or Editor */}
                  <div className="mt-4 border-t border-black/[0.04] pt-4">
                    {isEditing ? (
                      /* Reply Textarea Editor */
                      <div className="grid gap-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-black/45">
                          Your Official Response
                        </label>
                        <textarea
                          rows={3}
                          value={draftReplyText}
                          disabled={saving}
                          onChange={(e) => setDraftReplyText(e.target.value)}
                          placeholder="Write a polite, professional reply to thank the couple, address feedback, or clarify details..."
                          className="w-full rounded-lg border border-black/[0.08] bg-white p-3.5 text-[13px] text-black/70 placeholder-black/30 outline-none focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-300 disabled:opacity-60 resize-y"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-black/30">
                            {draftReplyText.length} characters
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelReply}
                              disabled={saving}
                              className="h-9 px-4 rounded-lg border border-black/[0.08] bg-white text-[12px] font-bold text-black/50 hover:bg-[#fafafa] transition-all disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveReply(r.id)}
                              disabled={saving || !draftReplyText.trim()}
                              className="h-9 px-4 rounded-lg bg-[#a67c52] text-[12px] font-bold text-white hover:bg-[#8e6a46] transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {saving ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              <span>Submit Response</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : r.vendor_reply_text ? (
                      /* Display Active Reply */
                      <div className="rounded-lg border border-black/[0.04] bg-[#fafafa]/50 p-4 relative group/reply">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#a67c52]">
                              Your Response
                            </span>
                            {r.vendor_reply_at && (
                              <span className="text-[10px] text-black/30 font-medium">
                                {new Date(r.vendor_reply_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>

                          {/* Quick Reply Actions */}
                          <div className="flex items-center gap-1.5 opacity-60 group-hover/reply:opacity-100 transition-opacity">
                            {deletingReviewId === r.id ? (
                              <div className="flex items-center gap-2 text-[11px] bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-100">
                                <span>Delete response?</span>
                                <button
                                  type="button"
                                  onClick={() => confirmDeleteReply(r.id)}
                                  disabled={saving}
                                  className="font-bold hover:underline"
                                >
                                  Yes
                                </button>
                                <span className="text-red-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setDeletingReviewId(null)}
                                  disabled={saving}
                                  className="hover:underline text-neutral-500 font-medium"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartReply(r)}
                                  title="Edit reply"
                                  disabled={saving}
                                  className="p-1.5 rounded-lg border border-black/[0.06] bg-white text-black/50 hover:text-[#a67c52] hover:border-[#a67c52]/20 transition-all shadow-sm"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReply(r.id)}
                                  title="Delete reply"
                                  disabled={saving}
                                  className="p-1.5 rounded-lg border border-black/[0.06] bg-white text-black/50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[13px] leading-relaxed text-black/75 whitespace-pre-line">
                          {r.vendor_reply_text}
                        </p>
                      </div>
                    ) : (
                      /* Create Reply Button */
                      <button
                        type="button"
                        onClick={() => handleStartReply(r)}
                        className="h-10 px-4 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-black uppercase tracking-wider text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} />
                        <span>Reply to Review</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
