"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; slug: string };
type Region = { id: number; name: string };
type City = { id: number; name: string; region_id: number };
type Plan = { id: number; name: string };
type Affiliation = { id: number; name: string; slug: string };

type Props = {
  categories: Category[];
  regions: Region[];
  cities: City[];
  plans: Plan[];
  affiliations: Affiliation[];
  preselectedPlan?: string;
};

type FormState = {
  businessName: string;
  categoryId: string;
  secondaryCategorySlugs: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  secDtiNumber: string;
  coverPhotoUrl: string;
  logoUrl: string;
  regionId: string;
  city: string;
  address: string;
  contactPerson: string;
  adminEmail: string;
  adminPhone: string;
  affiliationSlug: string;
  description: string;
  planId: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  x: string;
  pinterest: string;
  youtube: string;
  creditCardNumber: string;
  agreeToTerms: boolean;
};

const initialState: FormState = {
  businessName: "",
  categoryId: "",
  secondaryCategorySlugs: "",
  contactEmail: "",
  contactPhone: "",
  websiteUrl: "",
  secDtiNumber: "",
  coverPhotoUrl: "",
  logoUrl: "",
  regionId: "",
  city: "",
  address: "",
  contactPerson: "",
  adminEmail: "",
  adminPhone: "",
  affiliationSlug: "",
  description: "",
  planId: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  x: "",
  pinterest: "",
  youtube: "",
  creditCardNumber: "",
  agreeToTerms: false,
};

function isValidCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

export default function RegisterForm({ categories, regions, cities, plans, affiliations, preselectedPlan }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    ...initialState,
    planId: preselectedPlan ?? "",
  });
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cardTouched, setCardTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (preselectedPlan) {
      setForm((prev) => ({ ...prev, planId: preselectedPlan }));
    }
  }, [preselectedPlan]);

  const cityOptions = useMemo(() => {
    const regionIdNum = Number(form.regionId);
    if (!Number.isFinite(regionIdNum)) return [] as City[];
    return (cities ?? [])
      .filter((c) => c.region_id === regionIdNum)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, form.regionId]);

  const affiliationOptions = useMemo(() => {
    return (affiliations ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [affiliations]);

  const categoryOptions = useMemo(() => {
    const safe = categories ?? [];
    return safe.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors.has(key as string)) {
      setFieldErrors((prev) => {
        const next = new Set(prev);
        next.delete(key as string);
        return next;
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors(new Set());

    const errors = new Set<string>();
    if (!form.businessName.trim()) errors.add("businessName");
    if (!form.categoryId) errors.add("categoryId");
    if (!form.planId) errors.add("planId");
    if (!form.contactEmail.trim()) errors.add("contactEmail");
    if (!form.contactPhone.trim()) errors.add("contactPhone");
    if (!form.secDtiNumber.trim()) errors.add("secDtiNumber");
    if (!form.contactPerson.trim()) errors.add("contactPerson");
    if (!form.address.trim()) errors.add("address");
    if (!form.regionId) errors.add("regionId");
    if (!form.city) errors.add("city");
    if (!form.description.trim()) errors.add("description");
    if (form.description.trim().length > 500) errors.add("description");
    if (!form.coverPhotoUrl.trim()) errors.add("coverPhotoUrl");
    if (!form.logoUrl.trim()) errors.add("logoUrl");
    if (!form.creditCardNumber.trim()) errors.add("creditCardNumber");
    if (form.creditCardNumber.trim() && !isValidCreditCard(form.creditCardNumber.trim())) errors.add("creditCardNumber");
    if (!form.adminEmail.trim()) errors.add("adminEmail");
    if (!form.adminPhone.trim()) errors.add("adminPhone");
    if (!form.agreeToTerms) errors.add("agreeToTerms");

    if (errors.size > 0) {
      setFieldErrors(errors);
      const firstError = Array.from(errors)[0];
      const element = document.getElementById(`field-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

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
          secDtiNumber: form.secDtiNumber,
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
            affiliation_slug: form.affiliationSlug.trim() || null,
            secondaryCategorySlugs: form.secondaryCategorySlugs,
            cover_photo_url: form.coverPhotoUrl,
            logo_url: form.logoUrl,
            credit_card_number: form.creditCardNumber.trim() || null,
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
        <Field id="field-businessName" label="Business name" required>
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("businessName") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
          />
        </Field>

        <Field id="field-categoryId" label="Primary category">
          <select
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] bg-white ${
              fieldErrors.has("categoryId")
                ? "border-red-500 bg-red-50"
                : form.categoryId
                  ? "text-[#2c2c2c] border-black/10"
                  : "text-black/55 border-black/10"
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

        <Field id="field-planId" label="Plan">
          <select
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] bg-white ${
              fieldErrors.has("planId")
                ? "border-red-500 bg-red-50"
                : form.planId
                  ? "text-[#2c2c2c] border-black/10"
                  : "text-black/55 border-black/10"
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

        <Field id="field-contactEmail" label="Email" required>
          <input
            type="email"
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("contactEmail") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>

        <Field id="field-contactPhone" label="Phone">
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("contactPhone") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>

        <Field id="field-secDtiNumber" label="SEC/DTI #">
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("secDtiNumber") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.secDtiNumber}
            onChange={(e) => set("secDtiNumber", e.target.value)}
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

        <Field id="field-contactPerson" label="Contact person">
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("contactPerson") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="field-regionId" label="Region">
          <select
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] bg-white ${
              fieldErrors.has("regionId")
                ? "border-red-500 bg-red-50"
                : form.regionId
                  ? "text-[#2c2c2c] border-black/10"
                  : "text-black/55 border-black/10"
            }`}
            value={form.regionId}
            onChange={(e) => {
              const next = e.target.value;
              set("regionId", next);
              set("city", "");
            }}
          >
            <option value="">Select</option>
            {regions.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="field-city" label="City">
          <select
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] bg-white ${
              fieldErrors.has("city")
                ? "border-red-500 bg-red-50"
                : form.city
                  ? "text-[#2c2c2c] border-black/10"
                  : "text-black/55 border-black/10"
            }`}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            disabled={!form.regionId}
          >
            <option value="">{form.regionId ? "Select" : "Select region first"}</option>
            {cityOptions.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="field-address" label="Address">
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("address") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
      </div>

      <Field id="field-description" label="Business description" hint={`${form.description.length}/500`}>
        <textarea
          maxLength={500}
          className={`min-h-24 w-full rounded-[3px] border px-3 py-2 text-[13px] ${fieldErrors.has("description") ? "border-red-500 bg-red-50" : "border-black/10"}`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-2">
        <div id="field-coverPhotoUrl" className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-semibold text-black/55">
              Cover photo <span className="text-[#b42318]">*</span>
            </div>
            <div className="mt-1 text-[12px] text-black/45">Required. Used as your cover photo during review.</div>
          </div>
          <button
            type="button"
            onClick={() => setCoverModalOpen(true)}
            className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/2 transition-colors"
          >
            {form.coverPhotoUrl.trim() ? "Change cover photo" : "Add cover photo"}
          </button>
        </div>

        <div className={`rounded-[3px] border-2 bg-white overflow-hidden ${fieldErrors.has("coverPhotoUrl") ? "border-red-500" : "border-black/10"}`}>
          <div className="h-44 sm:h-52 bg-[#fcfbf9] flex items-center justify-center">
            {form.coverPhotoUrl.trim() ? (
              <img
                src={form.coverPhotoUrl.trim()}
                alt="Cover preview"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            ) : (
              <div className="text-[12px] font-semibold text-black/35">No cover photo yet</div>
            )}
          </div>
        </div>
      </div>

      <CoverPhotoModal
        open={coverModalOpen}
        url={form.coverPhotoUrl}
        onCancel={() => setCoverModalOpen(false)}
        onSave={(url: string) => {
          set("coverPhotoUrl", url);
          setCoverModalOpen(false);
        }}
      />

      <div className="grid gap-2">
        <div id="field-logoUrl" className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-semibold text-black/55">
              Logo <span className="text-[#b42318]">*</span>
            </div>
            <div className="mt-1 text-[12px] text-black/45">Required. Your business logo.</div>
          </div>
          <button
            type="button"
            onClick={() => setLogoModalOpen(true)}
            className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/2 transition-colors"
          >
            {form.logoUrl.trim() ? "Change logo" : "Add logo"}
          </button>
        </div>

        <div className={`rounded-[3px] border-2 bg-white overflow-hidden ${fieldErrors.has("logoUrl") ? "border-red-500" : "border-black/10"}`}>
          <div className="h-32 w-32 mx-auto bg-[#fcfbf9] flex items-center justify-center">
            {form.logoUrl.trim() ? (
              <img
                src={form.logoUrl.trim()}
                alt="Logo preview"
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            ) : (
              <div className="text-[12px] font-semibold text-black/35">No logo yet</div>
            )}
          </div>
        </div>
      </div>

      <LogoModal
        open={logoModalOpen}
        url={form.logoUrl}
        onCancel={() => setLogoModalOpen(false)}
        onSave={(url: string) => {
          set("logoUrl", url);
          setLogoModalOpen(false);
        }}
      />

      <Field id="field-creditCardNumber" label="Credit/Debit card number" required>
        <div className="grid gap-1">
          <div className="relative">
            <input
              type="text"
              className={`h-10 w-full rounded-[3px] border px-3 text-[13px] pr-10 ${
                fieldErrors.has("creditCardNumber")
                  ? "border-red-500 bg-red-50"
                  : cardTouched
                    ? isValidCreditCard(form.creditCardNumber)
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-black/10"
              }`}
              value={form.creditCardNumber}
              onChange={(e) => set("creditCardNumber", formatCardNumber(e.target.value))}
              onBlur={() => setCardTouched(true)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {cardTouched && form.creditCardNumber.trim() && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidCreditCard(form.creditCardNumber) ? (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
            )}
          </div>
          {cardTouched && form.creditCardNumber.trim() && !isValidCreditCard(form.creditCardNumber) && (
            <span className="text-[11px] text-red-600">Invalid card number. Please check and try again.</span>
          )}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="field-adminEmail" label="Admin email">
          <input
            type="email"
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("adminEmail") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e.target.value)}
          />
        </Field>
        <Field id="field-adminPhone" label="Admin phone">
          <input
            className={`h-10 w-full rounded-[3px] border px-3 text-[13px] ${fieldErrors.has("adminPhone") ? "border-red-500 bg-red-50" : "border-black/10"}`}
            value={form.adminPhone}
            onChange={(e) => set("adminPhone", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Affiliations / associations" hint="Optional.">
        <select
          className={`h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-white ${
            form.affiliationSlug ? "text-[#2c2c2c]" : "text-black/55"
          }`}
          value={form.affiliationSlug}
          onChange={(e) => set("affiliationSlug", e.target.value)}
        >
          <option value="">None</option>
          {affiliationOptions.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
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

      <div className="grid gap-1">
        <label id="field-agreeToTerms" className="flex items-start gap-3 text-[13px] text-black/70">
          <input
            type="checkbox"
            className={`mt-1 h-4 w-4 ${fieldErrors.has("agreeToTerms") ? "accent-red-500" : ""}`}
            checked={form.agreeToTerms}
            onChange={(e) => set("agreeToTerms", e.target.checked)}
          />
          <span className="text-[13px]">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="text-[#6e4f33] hover:underline">
              Terms & Conditions
            </a>
            .
          </span>
        </label>
        {fieldErrors.has("agreeToTerms") && (
          <span className="ml-7 text-[11px] text-red-600">You must agree to the Terms & Conditions.</span>
        )}
      </div>

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

function CoverPhotoModal({
  open,
  url,
  onCancel,
  onSave,
}: {
  open: boolean;
  url: string;
  onCancel: () => void;
  onSave: (url: string) => void;
}) {
  const [value, setValue] = useState(url);

  useEffect(() => {
    if (open) setValue(url);
  }, [open, url]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">Cover photo</div>
          <div className="mt-1 text-[12px] text-black/45">Paste an image URL for your cover photo.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-32 w-full max-w-[320px] rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
              {value.trim() ? (
                <img src={value.trim()} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No image
                </div>
              )}
            </div>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Image URL</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://..."
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setValue(url);
                onCancel();
              }}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(value.trim())}
              disabled={!value.trim()}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoModal({
  open,
  url,
  onCancel,
  onSave,
}: {
  open: boolean;
  url: string;
  onCancel: () => void;
  onSave: (url: string) => void;
}) {
  const [value, setValue] = useState(url);

  useEffect(() => {
    if (open) setValue(url);
  }, [open, url]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">Logo</div>
          <div className="mt-1 text-[12px] text-black/45">Paste an image URL for your logo.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
              {value.trim() ? (
                <img src={value.trim()} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No image
                </div>
              )}
            </div>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Image URL</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://..."
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setValue(url);
                onCancel();
              }}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(value.trim())}
              disabled={!value.trim()}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  badge,
  hint,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="grid gap-1.5">
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
