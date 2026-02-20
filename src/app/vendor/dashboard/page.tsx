"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

type VendorProfile = {
  id: number;
  user_id: string;
  business_name: string;
  slug: string;
  description: string | null;
  location_text: string | null;
  city: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  plan_id: number | null;
  is_active: boolean | null;
  verified_status: string | null;
};

type SocialLink = { id: number; platform: string; url: string };
type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
};

async function apiFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    location_text: "",
    city: "",
    address: "",
    website_url: "",
    contact_phone: "",
  });
  const [socials, setSocials] = useState<Array<{ platform: string; url: string }>>([
    { platform: "facebook", url: "" },
    { platform: "instagram", url: "" },
    { platform: "tiktok", url: "" },
  ]);
  const [images, setImages] = useState<Array<{ image_url: string; caption: string; is_cover: boolean; display_order: number }>>([
    { image_url: "", caption: "", is_cover: true, display_order: 1 },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      const user = session?.user ?? null;

      if (!cancelled) {
        setEmail(user?.email ?? null);
        setToken(session?.access_token ?? null);
        if (!user) {
          router.push("/");
          return;
        }

        if (!session?.access_token) {
          setError("Missing auth session. Please open the invite link again.");
          setLoading(false);
          return;
        }

        try {
          const json = await apiFetch<{
            vendor: VendorProfile;
            socials: SocialLink[];
            images: VendorImage[];
          }>("/api/vendor/profile", session.access_token);

          setVendor(json.vendor);
          setForm({
            business_name: json.vendor.business_name ?? "",
            description: json.vendor.description ?? "",
            location_text: json.vendor.location_text ?? "",
            city: json.vendor.city ?? "",
            address: json.vendor.address ?? "",
            website_url: json.vendor.website_url ?? "",
            contact_phone: json.vendor.contact_phone ?? "",
          });

          const s = (json.socials ?? []).map((x) => ({ platform: x.platform, url: x.url }));
          setSocials(s.length > 0 ? s : [{ platform: "facebook", url: "" }]);

          const normalizedImgs = (json.images ?? []).map((img, idx) => ({
            image_url: img.image_url,
            caption: img.caption ?? "",
            is_cover: Boolean(img.is_cover),
            display_order: typeof img.display_order === "number" ? img.display_order : idx + 1,
          }));

          setImages(
            normalizedImgs.length > 0
              ? ensureSingleCover(normalizedImgs)
              : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
          );
        } catch (e: any) {
          setError(e?.message ?? "Failed to load vendor profile.");
        } finally {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function saveProfile() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ vendor: VendorProfile }>("/api/vendor/profile", token, {
        method: "PATCH",
        body: JSON.stringify({
          business_name: form.business_name,
          description: form.description || null,
          location_text: form.location_text || null,
          city: form.city || null,
          address: form.address || null,
          website_url: form.website_url || null,
          contact_phone: form.contact_phone || null,
        }),
      });
      setVendor(res.vendor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSocials() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ socials: SocialLink[] }>("/api/vendor/social-links", token, {
        method: "PUT",
        body: JSON.stringify({ socials }),
      });

      const s = (res.socials ?? []).map((x) => ({ platform: x.platform, url: x.url }));
      setSocials(s.length > 0 ? s : [{ platform: "facebook", url: "" }]);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save social links.");
    } finally {
      setSaving(false);
    }
  }

  async function saveImages() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const payload = ensureSingleCover(images)
        .filter((i) => i.image_url.trim().length > 0)
        .map((i, idx) => ({
          image_url: i.image_url,
          caption: i.caption || null,
          is_cover: i.is_cover,
          display_order: i.display_order || idx + 1,
        }));

      const res = await apiFetch<{ images: VendorImage[] }>("/api/vendor/images", token, {
        method: "PUT",
        body: JSON.stringify({ images: payload }),
      });

      const normalizedImgs = (res.images ?? []).map((img, idx) => ({
        image_url: img.image_url,
        caption: img.caption ?? "",
        is_cover: Boolean(img.is_cover),
        display_order: typeof img.display_order === "number" ? img.display_order : idx + 1,
      }));

      setImages(
        normalizedImgs.length > 0
          ? ensureSingleCover(normalizedImgs)
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to save photos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black/5">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor dashboard</div>
            <div className="mt-1 text-[12px] text-black/45">
              Signed in as <span className="font-semibold text-[#2c2c2c]">{email ?? ""}</span>
              {vendor?.slug ? (
                <>
                  {" "}
                  · Public page: <a className="text-[#6e4f33] hover:underline" href={`/vendors/${vendor.slug}`} target="_blank" rel="noreferrer">/vendors/{vendor.slug}</a>
                </>
              ) : null}
            </div>
          </div>

          <div className="p-6 grid gap-6">
            {loading ? <div className="text-[13px] text-black/60">Loading…</div> : null}
            {error ? (
              <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error}
              </div>
            ) : null}

            {!loading ? (
              <>
                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Profile</div>
                    <div className="mt-1 text-[12px] text-black/45">Edit the details that show on your vendor page.</div>
                  </div>
                  <div className="p-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Business name">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.business_name} onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))} />
                      </Field>
                      <Field label="Public contact email">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-[#fcfbf9] text-black/60" value={vendor?.contact_email ?? ""} disabled />
                      </Field>
                    </div>

                    <Field label="Description">
                      <textarea className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Location label">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.location_text} onChange={(e) => setForm((p) => ({ ...p, location_text: e.target.value }))} />
                      </Field>
                      <Field label="City">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                      </Field>
                      <Field label="Phone">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Address">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                      </Field>
                      <Field label="Website">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} placeholder="https://..." />
                      </Field>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={saveProfile} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        {saving ? "Saving…" : "Save profile"}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Social links</div>
                    <div className="mt-1 text-[12px] text-black/45">Add links like Facebook, Instagram, TikTok.</div>
                  </div>
                  <div className="p-4 grid gap-3">
                    {socials.map((s, idx) => (
                      <div key={idx} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                        <Field label="Platform">
                          <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={s.platform} onChange={(e) => setSocials((rows) => rows.map((r, i) => (i === idx ? { ...r, platform: e.target.value } : r)))} />
                        </Field>
                        <Field label="URL">
                          <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={s.url} onChange={(e) => setSocials((rows) => rows.map((r, i) => (i === idx ? { ...r, url: e.target.value } : r)))} placeholder="https://..." />
                        </Field>
                        <button type="button" onClick={() => setSocials((rows) => rows.filter((_, i) => i !== idx))} className="h-10 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-2 justify-between pt-2">
                      <button type="button" onClick={() => setSocials((rows) => [...rows, { platform: "", url: "" }])} className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors">
                        Add link
                      </button>
                      <button type="button" onClick={saveSocials} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        {saving ? "Saving…" : "Save social links"}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Photos</div>
                    <div className="mt-1 text-[12px] text-black/45">Paste image URLs for now. Upload flow can be added later.</div>
                  </div>

                  <div className="p-4 grid gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                        <Field label={`Image URL #${idx + 1}`}>
                          <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={img.image_url} onChange={(e) => setImages((rows) => rows.map((r, i) => (i === idx ? { ...r, image_url: e.target.value } : r)))} placeholder="https://..." />
                        </Field>
                        <Field label="Cover">
                          <label className="flex items-center gap-2 h-10">
                            <input type="radio" name="cover" checked={img.is_cover} onChange={() => setImages((rows) => rows.map((r, i) => ({ ...r, is_cover: i === idx })))} />
                            <span className="text-[12px] font-semibold text-black/60">Use as cover</span>
                          </label>
                        </Field>
                        <button type="button" onClick={() => setImages((rows) => ensureSingleCover(rows.filter((_, i) => i !== idx)))} className="h-10 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors">
                          Remove
                        </button>
                        <div className="sm:col-span-3">
                          <Field label="Caption (optional)">
                            <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={img.caption} onChange={(e) => setImages((rows) => rows.map((r, i) => (i === idx ? { ...r, caption: e.target.value } : r)))} />
                          </Field>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-2 justify-between pt-2">
                      <button type="button" onClick={() => setImages((rows) => ensureSingleCover([...rows, { image_url: "", caption: "", is_cover: rows.length === 0, display_order: rows.length + 1 }]))} className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors">
                        Add photo
                      </button>
                      <button type="button" onClick={saveImages} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        {saving ? "Saving…" : "Save photos"}
                      </button>
                    </div>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-black/55">{label}</span>
      {children}
    </label>
  );
}

function ensureSingleCover<T extends { is_cover: boolean }>(rows: T[]) {
  let used = false;
  const normalized = rows.map((r) => {
    const v = Boolean((r as any).is_cover) && !used;
    if (v) used = true;
    return { ...r, is_cover: v };
  });
  if (!used && normalized.length > 0) {
    (normalized[0] as any).is_cover = true;
  }
  return normalized;
}
