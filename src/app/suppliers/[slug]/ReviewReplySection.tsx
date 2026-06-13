"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import { toast } from "@/lib/toast";

type Reply = {
  id: number;
  reply_text: string;
  created_at: string;
};

type Props = {
  reviewId: number;
  vendorSlug: string;
  initialReplies: Reply[];
};

export default function ReviewReplySection({ reviewId, vendorSlug, initialReplies }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggle = () => {
    setShowForm((v) => !v);
    if (!showForm) {
      // Focus textarea after toggle
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? "";
    if (!token) {
      router.push(`/signin?returnTo=${encodeURIComponent(`/suppliers/${vendorSlug}`)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyText: trimmed }),
      });

      const json = (await res.json().catch(() => null)) as { reply?: Reply; error?: string } | null;

      if (res.status === 401) {
        router.push(`/signin?returnTo=${encodeURIComponent(`/suppliers/${vendorSlug}`)}`);
        return;
      }

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to post reply.");
        return;
      }

      if (json?.reply) {
        setReplies((prev) => [...prev, json.reply!]);
      }
      setText("");
      setShowForm(false);
      toast.success("Reply posted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 ml-10">
      {/* Existing replies */}
      {replies.length > 0 && (
        <div className="grid gap-2 mb-2">
          {replies.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-black/[0.05] bg-[#fafafa] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3 w-3 text-[#a68b6a]" />
                <span className="text-[11px] font-semibold text-black/50">
                  Couple
                </span>
                <span className="text-[10px] text-black/30">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-black/65 whitespace-pre-line">
                {r.reply_text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        className="text-[11px] font-semibold text-[#a68b6a] hover:text-[#8e6a46] transition-colors flex items-center gap-1"
      >
        <MessageSquare className="h-3 w-3" />
        {showForm
          ? "Cancel"
          : replies.length > 0
          ? "Add a reply"
          : "Reply"}
      </button>

      {/* Reply form */}
      {showForm && (
        <div className="mt-2 flex gap-2 items-start">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Write a reply…"
            className="flex-1 min-h-[60px] rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-[#2c2c2c] placeholder:text-black/30 outline-none focus:border-[#a68b6a]/50 focus:ring-2 focus:ring-[#a68b6a]/15 transition-[border-color,box-shadow] duration-200 resize-none"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !text.trim()}
            className="mt-0.5 h-9 w-9 flex items-center justify-center rounded-lg bg-[#a68b6a] text-white hover:bg-[#8e6a46] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150"
            aria-label="Submit reply"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
