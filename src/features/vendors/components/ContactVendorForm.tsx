"use client";

import { useMemo, useState } from "react";

type Props = {
  vendorId: number;
  vendorName: string;
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export default function ContactVendorForm({ vendorId, vendorName }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
  });

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.email.trim() && form.message.trim());
  }, [form.email, form.message, form.name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vendorId,
          fromName: form.name,
          fromEmail: form.email,
          message: form.message,
          company: form.company,
          startedAt,
        }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        setError(json?.error ?? "Failed to send message.");
        return;
      }

      setSuccess(`Message sent to ${vendorName}.`);
      setForm({ name: "", email: "", message: "", company: "" });
      setStartedAt(Date.now());
    } catch {
      setError("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        className="text-[#6e4f33] hover:underline"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next && startedAt === null) setStartedAt(Date.now());
            return next;
          });
        }}
        aria-expanded={open}
      >
        Contact
      </button>

      {open ? (
        <div className="mt-4 rounded-[3px] border border-black/10 bg-[#fcfbf9] p-4">
          <div className="text-[13px] font-semibold text-[#2c2c2c]">Send a message</div>
          <div className="mt-1 text-[12px] text-black/50">Your email will be shared with the vendor so they can reply.</div>

          {error ? (
            <div className="mt-3 rounded-[3px] border border-red-500/20 bg-red-50 px-3 py-2 text-[12px] text-red-900">{error}</div>
          ) : null}
          {success ? (
            <div className="mt-3 rounded-[3px] border border-[#a67c52]/25 bg-[#fffaf5] px-3 py-2 text-[12px] text-[#2c2c2c]">{success}</div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Your name</span>
              <input
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                autoComplete="name"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Your email</span>
              <input
                type="email"
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Message</span>
              <textarea
                className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              />
            </label>

            <label className="hidden" aria-hidden="true">
              <span>Company</span>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {submitting ? <Spinner className="text-white/90" /> : null}
                  <span>{submitting ? "Sending…" : "Send"}</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
