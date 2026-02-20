"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; slug: string };
type Region = { id: number; name: string };
type Plan = { id: number; name: string };

type Props = {
  categories: Category[];
  regions: Region[];
  plans: Plan[];
};

type FormState = {
  businessName: string;
  categoryId: string;
  secondaryCategorySlugs: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  regionId: string;
  city: string;
  address: string;
  contactPerson: string;
  adminEmail: string;
  adminPhone: string;
  affiliations: string;
  description: string;
  planId: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  x: string;
  pinterest: string;
  youtube: string;
  agreeToTerms: boolean;
};

const initialState: FormState = {
  businessName: "",
  categoryId: "",
  secondaryCategorySlugs: "",
  contactEmail: "",
  contactPhone: "",
  websiteUrl: "",
  regionId: "",
  city: "",
  address: "",
  contactPerson: "",
  adminEmail: "",
  adminPhone: "",
  affiliations: "",
  description: "",
  planId: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  x: "",
  pinterest: "",
  youtube: "",
  agreeToTerms: false,
};

export default function RegisterForm({ categories, regions, plans }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categoryOptions = useMemo(() => {
    const safe = categories ?? [];
    return safe.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.businessName.trim()) return setError("Business name is required.");
    if (!form.contactEmail.trim()) return setError("Email is required.");
    if (!form.agreeToTerms) return setError("You must agree to the Terms & Conditions.");

    setSubmitting(true);

    try {
      const res = await fetch("/api/vendor-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          categoryId: form.categoryId,
          websiteUrl: form.websiteUrl,
          planId: form.planId,
          description: form.description,
          location: {
            regionId: form.regionId,
            city: form.city,
            address: form.address,
          },
          extra: {
            contactPerson: form.contactPerson,
            adminEmail: form.adminEmail,
            adminPhone: form.adminPhone,
            affiliations: form.affiliations,
            secondaryCategorySlugs: form.secondaryCategorySlugs,
            social: {
              facebook: form.facebook,
              instagram: form.instagram,
              tiktok: form.tiktok,
              x: form.x,
              pinterest: form.pinterest,
              youtube: form.youtube,
            },
            agreedToTermsAt: new Date().toISOString(),
          },
        }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(json?.error ?? "Failed to submit registration.");
        return;
      }

      setSuccess(true);
      setForm(initialState);
      router.push("/register/success");
    } catch {
      setError("Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-[3px] border border-black/10 bg-white px-4 py-3 text-[12px] text-black/60">
        Fields marked <span className="inline-flex items-center rounded-[999px] border border-[#a67c52]/35 bg-[#fffaf5] px-2 py-0.5 font-semibold text-[#6e4f33]">Premium</span> are only used for Premium listings.
      </div>

      {error ? <div className="rounded-[3px] border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] text-red-900">{error}</div> : null}
      {success ? (
        <div className="rounded-[3px] border border-[#a67c52]/25 bg-[#fffaf5] px-4 py-3 text-[13px] text-[#2c2c2c]">
          Registration submitted. We’ll review it and get back to you.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" required>
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
          />
        </Field>

        <Field label="Primary category">
          <select
            className={`h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-white ${
              form.categoryId ? "text-[#2c2c2c]" : "text-black/55"
            }`}
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="">Select a category</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Other categories (optional)" hint="Comma-separated slugs or names (max 2).">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.secondaryCategorySlugs}
            onChange={(e) => set("secondaryCategorySlugs", e.target.value)}
            placeholder="e.g. florist--event-stylist, lights--sounds--staging"
          />
        </Field>

        <Field label="Plan">
          <select
            className={`h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-white ${
              form.planId ? "text-[#2c2c2c]" : "text-black/55"
            }`}
            value={form.planId}
            onChange={(e) => set("planId", e.target.value)}
          >
            <option value="">Select a plan</option>
            {plans.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>

        <Field label="Phone (public)">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>

        <Field label="Website" badge="Premium">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.websiteUrl}
            onChange={(e) => set("websiteUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Contact person">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Region">
          <select
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-white"
            value={form.regionId}
            onChange={(e) => set("regionId", e.target.value)}
          >
            <option value="">Select</option>
            {regions.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Address">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Business description">
        <textarea
          className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Admin email (optional)" badge="Premium">
          <input
            type="email"
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e.target.value)}
          />
        </Field>
        <Field label="Admin phone (optional)" badge="Premium">
          <input
            className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
            value={form.adminPhone}
            onChange={(e) => set("adminPhone", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Affiliations / associations" hint="Optional. Separate items with commas.">
        <input
          className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
          value={form.affiliations}
          onChange={(e) => set("affiliations", e.target.value)}
        />
      </Field>

      <div className="rounded-[3px] border border-black/10 bg-white p-4">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Social links (optional)</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Facebook" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
          </Field>
          <Field label="Instagram" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="TikTok" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} />
          </Field>
          <Field label="X" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.x} onChange={(e) => set("x", e.target.value)} />
          </Field>
          <Field label="Pinterest" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.pinterest} onChange={(e) => set("pinterest", e.target.value)} />
          </Field>
          <Field label="YouTube" badge="Premium">
            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} />
          </Field>
        </div>
      </div>

      <label className="flex items-start gap-3 text-[13px] text-black/70">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={form.agreeToTerms}
          onChange={(e) => set("agreeToTerms", e.target.checked)}
        />
        <span>
          I agree to the Terms & Conditions.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit registration"}
      </button>

      <div className="text-[12px] text-black/45">
        Note: Document upload (DTI/SEC/TIN) will be added next once the storage bucket name is confirmed.
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  badge,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <div className="text-[12px] font-semibold text-black/60">{label}</div>
        {required ? <div className="text-[11px] font-semibold text-[#6e4f33]">Required</div> : null}
        {badge ? (
          <div className="inline-flex items-center rounded-[999px] border border-[#a67c52]/35 bg-[#fffaf5] px-2 py-0.5 text-[11px] font-semibold text-[#6e4f33]">
            {badge}
          </div>
        ) : null}
      </div>
      {children}
      {hint ? <div className="text-[12px] text-black/45">{hint}</div> : null}
    </div>
  );
}
