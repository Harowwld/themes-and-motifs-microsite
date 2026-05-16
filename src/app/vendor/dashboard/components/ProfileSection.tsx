import React from "react";
import { Field, Spinner } from "./DashboardSections";
import { VendorProfile, VendorImage } from "../types";
import { ImageUploadDropzone } from "../../../../components/ImageUploadDropzone";
import { ensureSingleCover, clampPct, clampZoom } from "../utils";
import { LogoModal, CoverCropperModal } from "./DashboardModals";

export function ProfileSection({
  vendor,
  subscription,
  form,
  setForm,
  saving,
  saveProfile,
  saveVerificationDoc,
  images,
  cropperOpen,
  setCropperOpen,
  saveCoverCrop,
  logoModalOpen,
  setLogoModalOpen,
  isPremium
}: {
  vendor: VendorProfile | null;
  subscription: any;
  form: any;
  setForm: any;
  saving: boolean;
  saveProfile: () => void;
  saveVerificationDoc: (url: string) => void;
  images: VendorImage[];
  cropperOpen: boolean;
  setCropperOpen: (v: boolean) => void;
  saveCoverCrop: (v: any) => void;
  logoModalOpen: boolean;
  setLogoModalOpen: (v: boolean) => void;
  isPremium: boolean;
}) {
  if (!vendor) return null;

  return (
    <div className="grid gap-12">
      <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="bg-[#fafafa]/50 px-6 py-3 text-[12px] text-black/50 border-b border-black/[0.04] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">Plan:</span>
            <span className="font-semibold text-[#a67c52] bg-[#a67c52]/10 px-2 py-0.5 rounded text-[11px]">
              {(Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? ""}
            </span>
            {!isPremium ? (
              <span className="ml-1 italic text-black/40">
                (Some fields are Premium-only)
              </span>
            ) : null}
          </div>
          {subscription?.expiry_date && (
            <div>
              Expiry: <span className="font-semibold text-[#2c2c2c]">{new Date(subscription.expiry_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="p-6 grid gap-4">
          <div className="text-[13px] font-bold text-[#2c2c2c] uppercase tracking-wider">Plan Verification Document</div>
          <div className="text-[12px] text-black/45 -mt-1">Upload a document (e.g. DTI Registration, ID) to verify your vendor plan.</div>
          <div className="max-w-md mt-2">
            <ImageUploadDropzone
              bucket="vendor-assets"
              folder="verifications"
              label=""
              onUploadComplete={(res) => saveVerificationDoc(res.url)}
              existingUrl={subscription?.verification_doc_url}
              onClear={() => saveVerificationDoc("")}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Profile Details</h2>
          <div className="mt-1 text-[12px] text-black/45">Edit the core business details that show on your vendor page.</div>
        </div>
        <div className="p-6 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Business name">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.business_name} onChange={(e) => setForm((p: any) => ({ ...p, business_name: e.target.value }))} />
            </Field>
            <Field label="Public contact email">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] px-4 text-[13px] bg-[#fafafa] text-black/40 cursor-not-allowed" value={vendor?.contact_email ?? ""} disabled />
            </Field>
          </div>

          <div className="rounded-lg border border-black/[0.06] bg-[#fafafa]/30 p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-black/40">Business Logo</div>
            <div className="mt-1 text-[12px] text-black/45">
              This appears on your vendor card and profile page.
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-24 w-24 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#fafafa] flex items-center justify-center text-[10px] text-black/30 font-bold uppercase tracking-tighter text-center px-2">
                    No Logo
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setLogoModalOpen(true)}
                  className="h-9 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                >
                  {form.logo_url ? "Change Logo" : "Add Logo"}
                </button>
                {form.logo_url && (
                  <div className="text-[10px] text-black/40 italic">Recommended: Square PNG/SVG</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/[0.06] bg-[#fafafa]/30 p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-black/40">Card Cover Position</div>
            <div className="mt-1 text-[12px] text-black/45">
              Fine-tune how your cover photo displays on search results.
            </div>

            {(() => {
              const cover = ensureSingleCover(images).find((i) => i.is_cover && i.image_url.trim());
              const x = clampPct(Number(form.cover_focus_x));
              const y = clampPct(Number(form.cover_focus_y));
              const z = clampZoom(Number(form.cover_zoom));
              const pos = `${x}% ${y}%`;

              return (
                <div className="mt-4 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
                  <div
                    className="h-28 w-full rounded-lg border border-white shadow-md overflow-hidden bg-[#fafafa] ring-1 ring-black/[0.05]"
                    style={{
                      backgroundImage: cover?.image_url ? `url(${cover.image_url})` : undefined,
                      backgroundSize: `${z * 100}% ${z * 100}%`,
                      backgroundPosition: pos,
                    }}
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#a67c52]">Zoom: {Math.round(z * 100)}%</span>
                      <span className="h-1 w-1 rounded-full bg-black/10" />
                      <span className="text-[12px] text-black/40">Position: {x}% {y}%</span>
                    </div>
                    <button
                      type="button"
                      className="h-9 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => setCropperOpen(true)}
                      disabled={!cover?.image_url}
                    >
                      Adjust Crop Position
                    </button>
                    {!cover?.image_url ? (
                      <div className="text-[11px] text-red-400/80 font-medium">
                        Please add a cover photo in the "Photos" section first.
                      </div>
                    ) : null}
                  </div>

                  {cover?.image_url ? (
                    <CoverCropperModal
                      open={cropperOpen}
                      imageUrl={cover.image_url}
                      initialFocusX={x}
                      initialFocusY={y}
                      initialZoom={z}
                      minZoom={1}
                      maxZoom={3}
                      onCancel={() => setCropperOpen(false)}
                      onSave={(next) => void saveCoverCrop(next)}
                    />
                  ) : null}

                  <LogoModal
                    open={logoModalOpen}
                    logoUrl={form.logo_url}
                    onCancel={() => setLogoModalOpen(false)}
                    onSave={(url) => {
                      setForm((p: any) => ({ ...p, logo_url: url }));
                      setLogoModalOpen(false);
                    }}
                  />
                </div>
              );
            })()}
          </div>

          <Field label="What Makes Us Unique">
            <div className="relative">
              <textarea
                className="min-h-32 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 py-3 text-[13px] pr-14 leading-relaxed transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none resize-none"
                value={form.description}
                onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value.slice(0, 300) }))}
                maxLength={300}
                placeholder="Tell couples what makes your business special..."
              />
              <span className="absolute bottom-3 right-4 text-[10px] font-bold text-black/30 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm">{(form.description?.length ?? 0)}/300</span>
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Region">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.location_text} onChange={(e) => setForm((p: any) => ({ ...p, location_text: e.target.value }))} />
            </Field>
            <Field label="City/Wedding Center">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.city} onChange={(e) => setForm((p: any) => ({ ...p, city: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed" value={form.contact_phone} onChange={(e) => setForm((p: any) => ({ ...p, contact_phone: e.target.value }))} disabled={!isPremium} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Address">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.address} onChange={(e) => setForm((p: any) => ({ ...p, address: e.target.value }))} />
            </Field>
            <Field label="Website">
              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed" value={form.website_url} onChange={(e) => setForm((p: any) => ({ ...p, website_url: e.target.value }))} placeholder="https://..." disabled={!isPremium} />
            </Field>
          </div>

          <div className="my-8 border-t border-black/[0.04]" />
          
          <div className="bg-[#fafafa]/50 rounded-lg p-6 border border-black/[0.03]">
            <h3 className="font-serif text-[16px] font-semibold text-[#2c2c2c] mb-6 flex items-center gap-2">
              <div className="h-8 w-1 bg-[#a67c52] rounded-full" />
              Admin & Contact Info <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-black/30 ml-auto">Internal Use Only</span>
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2 mb-6">
              <Field label="Contact Person 1 Name">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_1_name} onChange={(e) => setForm((p: any) => ({ ...p, contact_person_1_name: e.target.value }))} />
              </Field>
              <Field label="Position 1">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_1_position} onChange={(e) => setForm((p: any) => ({ ...p, contact_person_1_position: e.target.value }))} />
              </Field>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 mb-6">
              <Field label="Contact Person 2 Name">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_2_name} onChange={(e) => setForm((p: any) => ({ ...p, contact_person_2_name: e.target.value }))} />
              </Field>
              <Field label="Position 2">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_2_position} onChange={(e) => setForm((p: any) => ({ ...p, contact_person_2_position: e.target.value }))} />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 mb-6">
              <Field label="Admin Email 1">
                <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_1} onChange={(e) => setForm((p: any) => ({ ...p, admin_email_1: e.target.value }))} />
              </Field>
              <Field label="Admin Email 2">
                <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_2} onChange={(e) => setForm((p: any) => ({ ...p, admin_email_2: e.target.value }))} />
              </Field>
              <Field label="Admin Email 3">
                <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_3} onChange={(e) => setForm((p: any) => ({ ...p, admin_email_3: e.target.value }))} />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Admin Phone 1">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_1} onChange={(e) => setForm((p: any) => ({ ...p, admin_phone_1: e.target.value }))} />
              </Field>
              <Field label="Admin Phone 2">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_2} onChange={(e) => setForm((p: any) => ({ ...p, admin_phone_2: e.target.value }))} />
              </Field>
              <Field label="Admin Phone 3">
                <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_3} onChange={(e) => setForm((p: any) => ({ ...p, admin_phone_3: e.target.value }))} />
              </Field>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="button" onClick={saveProfile} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60 disabled:shadow-none">
              <span className="inline-flex items-center gap-2">
                {saving ? <Spinner className="text-white/90" /> : null}
                <span>{saving ? "Saving Changes…" : "Save Profile Details"}</span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
