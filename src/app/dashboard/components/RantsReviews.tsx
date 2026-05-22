"use client";

import { useState } from "react";
import { Lock, Trash2, Star, Flame, Heart, AlertCircle, AlertTriangle, CloudRain, Sparkles, HelpCircle, Smile } from "lucide-react";
import { RantReview } from "../types";

interface RantsReviewsProps {
  entries: RantReview[];
  onAddEntry: (entry: Omit<RantReview, "id" | "date">) => void;
  onDeleteEntry: (id: string) => void;
}

const MOODS = [
  { emoji: "🤯", label: "Stressed" },
  { emoji: "😍", label: "Loved it" },
  { emoji: "🙄", label: "Annoyed" },
  { emoji: "😭", label: "Emotional" },
  { emoji: "🥳", label: "Excited" },
  { emoji: "🤔", label: "Contemplating" },
];

const getMoodIcon = (mood: string, size = 14) => {
  switch (mood) {
    case "🤯":
    case "Stressed":
      return <AlertCircle size={size} className="text-amber-600" />;
    case "😍":
    case "Loved it":
      return <Heart size={size} className="fill-rose-500 text-rose-500" />;
    case "🙄":
    case "Annoyed":
      return <AlertTriangle size={size} className="text-neutral-500" />;
    case "😭":
    case "Emotional":
      return <CloudRain size={size} className="text-blue-500" />;
    case "🥳":
    case "Excited":
      return <Sparkles size={size} className="text-amber-500 fill-amber-100" />;
    case "🤔":
    case "Contemplating":
      return <HelpCircle size={size} className="text-indigo-500" />;
    default:
      return <Smile size={size} className="text-neutral-400" />;
  }
};

export default function RantsReviews({ entries, onAddEntry, onDeleteEntry }: RantsReviewsProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<RantReview["type"]>("rant");
  const [mood, setMood] = useState(MOODS[0].emoji);
  const [rating, setRating] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddEntry({
      title: title.trim(),
      content: content.trim(),
      type,
      mood,
      rating: type === "review" ? parseInt(rating) : undefined,
    });
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Diary Creator Form */}
        <div className="w-full lg:w-[350px] shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm self-start">
          <h3 className="text-[15px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-4">
            New Journal Entry
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Journal Type</label>
              <div className="grid grid-cols-2 gap-2 bg-[#fafafa] border border-black/[0.04] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType("rant")}
                  className={`py-1.5 px-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    type === "rant" ? "bg-[#bba374] text-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <Flame size={12} className={type === "rant" ? "fill-white/20" : ""} />
                  Rant
                </button>
                <button
                  type="button"
                  onClick={() => setType("review")}
                  className={`py-1.5 px-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    type === "review" ? "bg-[#a68b6a] text-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <Heart size={12} className={type === "review" ? "fill-white/20" : ""} />
                  Review
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Entry Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "rant" ? "e.g. In-laws demanding extra tables" : "e.g. Venue food tasting thoughts"}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
              />
            </div>

            {type === "review" && (
              <div>
                <label className="text-[11px] font-bold text-neutral-500 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                >
                  <option value="5">5 Stars (Outstanding)</option>
                  <option value="4">4 Stars (Great)</option>
                  <option value="3">3 Stars (Neutral)</option>
                  <option value="2">2 Stars (Underwhelming)</option>
                  <option value="1">1 Star (Terrible)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1.5">How are you feeling?</label>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {MOODS.map((m) => {
                  const isSelected = mood === m.emoji;
                  return (
                    <button
                      key={m.emoji}
                      type="button"
                      onClick={() => setMood(m.emoji)}
                      className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#a68b6a]/10 border-[#a68b6a] scale-110 shadow-sm"
                          : "bg-white border-neutral-200 hover:scale-105 hover:bg-neutral-50"
                      }`}
                      title={m.label}
                    >
                      {getMoodIcon(m.emoji, 16)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Tell your journal...</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Spill the tea or write down what details occurred..."
                rows={5}
                className="w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 p-3 text-[13px] outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold rounded-lg transition-colors font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider cursor-pointer"
            >
              Add entry
            </button>
          </form>
        </div>

        {/* Private Diary Log */}
        <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-black/[0.04]">
            <Lock size={15} className="text-[#a68b6a]" />
            <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Candid Rants & Supplier Reviews
            </h3>
            <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full ml-auto">
              Private Diary
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[13px] text-neutral-400 leading-relaxed max-w-sm mx-auto">
                No entries yet! Planning a wedding can be stressful. Spill the tea privately on suppliers or family drama here. It stays strictly offline on your device!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {entries.map((entry) => {
                const isRant = entry.type === "rant";
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl p-5 border transition-all duration-300 ${
                      isRant
                        ? "bg-rose-50/20 border-rose-100/50 hover:border-rose-200"
                        : "bg-amber-50/15 border-amber-100/40 hover:border-amber-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center bg-white border border-neutral-100 shadow-sm"
                          title="Current Mood"
                        >
                          {getMoodIcon(entry.mood, 18)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] leading-tight">
                            {entry.title}
                          </h4>
                          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mt-1.5 ${
                            isRant
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {entry.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-neutral-100 cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {entry.rating && entry.type === "review" && (
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < (entry.rating || 0)
                                ? "fill-[#a68b6a] text-[#a68b6a]"
                                : "text-neutral-200 fill-transparent"
                            }
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-[13px] text-neutral-600 font-[family-name:var(--font-plus-jakarta)] leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    <div className="text-[10px] text-neutral-400 font-semibold mt-4 text-right">
                      {new Date(entry.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
