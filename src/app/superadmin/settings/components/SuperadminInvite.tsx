"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";


export function SuperadminInvite() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/superadmins/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation.");
      }

      toast.success(`Invitation sent to ${data.email}. They will receive an email with a link to set up their account.`);
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5">
        <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
          Invite Superadmin
        </div>
        <div className="mt-1 text-[12px] text-black/55">
          Invite a new superadmin to the platform. They will receive an email with a link to set up their account.
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newadmin@example.com"
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              required
              disabled={isSubmitting}
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-[11px] text-black/45">
          <strong>Note:</strong> The invitation link will expire in 7 days. Once accepted, the new superadmin can sign in with their email and the password they set.
        </div>
      </div>
    </div>
  );
}
