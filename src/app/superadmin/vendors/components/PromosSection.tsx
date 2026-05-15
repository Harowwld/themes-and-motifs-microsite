import React from "react";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import { Promo } from "../hooks/useSuperadminVendors";

export function PromosSection({
  editPromos,
  showPromoForm,
  setShowPromoForm,
  promoForm,
  setPromoForm,
  editingPromoId,
  resetPromoForm,
  savePromo,
  editLoading,
  togglePromoFeatured,
  startEditPromo,
  setPromoToDelete,
  editingVendorId
}: {
  editPromos: Promo[];
  showPromoForm: boolean;
  setShowPromoForm: (v: boolean) => void;
  promoForm: any;
  setPromoForm: (v: any) => void;
  editingPromoId: number | null;
  resetPromoForm: () => void;
  savePromo: () => void;
  editLoading: boolean;
  togglePromoFeatured: (p: Promo) => void;
  startEditPromo: (p: Promo) => void;
  setPromoToDelete: (v: number | null) => void;
  editingVendorId: number;
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2 flex items-center justify-between">
        <span>Promos</span>
        <button
          type="button"
          onClick={() => setShowPromoForm(true)}
          className="text-[12px] text-[#6e4f33] hover:underline"
        >
          + Add promo
        </button>
      </div>

      {showPromoForm && (
        <div className="rounded-[3px] border border-black/10 bg-[#fafafa] p-4 grid gap-3 overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[12px] font-semibold text-black/55">Title *</span>
              <input
                value={promoForm.title}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, title: e.target.value }))}
                className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px] break-words"
                placeholder="e.g., Summer Sale - 20% Off"
              />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[12px] font-semibold text-black/55">Summary</span>
              <textarea
                value={promoForm.summary ?? ""}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, summary: e.target.value }))}
                rows={2}
                className="rounded-[3px] border border-black/10 px-3 py-2 text-[13px] break-words"
                placeholder="Brief description of the promo..."
              />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[12px] font-semibold text-black/55">Terms & Conditions</span>
              <textarea
                value={promoForm.terms ?? ""}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, terms: e.target.value }))}
                rows={2}
                className="rounded-[3px] border border-black/10 px-3 py-2 text-[13px] break-words"
                placeholder="Terms and conditions..."
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid From</span>
              <input
                type="date"
                value={promoForm.valid_from ?? ""}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, valid_from: e.target.value }))}
                className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid To</span>
              <input
                type="date"
                value={promoForm.valid_to ?? ""}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, valid_to: e.target.value }))}
                className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Discount %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={promoForm.discount_percentage ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setPromoForm((f: any) => ({
                    ...f,
                    discount_percentage: val ? Math.min(100, Math.max(0, Number(val))) : null,
                  }));
                }}
                className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                placeholder="e.g., 20"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Status</span>
              <select
                value={promoForm.is_active ? "true" : "false"}
                onChange={(e) => setPromoForm((f: any) => ({ ...f, is_active: e.target.value === "true" }))}
                className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <span className="text-[12px] font-semibold text-black/55">Promo Image</span>
              <div className="mt-1.5">
                <ImageUploadDropzone
                  bucket="vendor-assets"
                  folder="promos"
                  entityId={String(editingVendorId)}
                  label="Upload Photo"
                  description="JPG, PNG, WebP up to 2MB. Will be compressed if needed."
                  onUploadComplete={(result) => {
                    setPromoForm((f: any) => ({ ...f, image_url: result.url }));
                  }}
                  onClear={() => {
                    setPromoForm((f: any) => ({ ...f, image_url: "" }));
                  }}
                  existingUrl={promoForm.image_url ?? ""}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={resetPromoForm}
              className="h-9 px-4 rounded-[3px] border border-black/10 text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={savePromo}
              disabled={editLoading}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
            >
              {editLoading ? "Saving..." : editingPromoId ? "Update Promo" : "Add Promo"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2 overflow-hidden">
        {editPromos.length === 0 ? (
          <div className="text-[12px] text-black/50 italic">No promos added yet.</div>
        ) : (
          editPromos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between p-3 rounded-[3px] border border-black/10 bg-white overflow-hidden"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#2c2c2c] truncate">{promo.title}</span>
                  {promo.is_featured && (
                    <span className="text-[10px] font-semibold bg-[#fff7ed] text-[#b54708] px-1.5 py-0.5 rounded">Featured</span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      promo.is_active
                        ? "bg-[#ecfdf3] text-[#027a48]"
                        : "bg-black/5 text-black/50"
                    }`}
                  >
                    {promo.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {(promo.summary || promo.discount_percentage !== null) && (
                  <div className="mt-1 text-[11px] text-black/55 truncate break-words">
                    {promo.discount_percentage !== null && `${promo.discount_percentage}% off`}
                    {promo.discount_percentage !== null && promo.summary && " • "}
                    {promo.summary}
                  </div>
                )}
                {(promo.valid_from || promo.valid_to) && (
                  <div className="mt-0.5 text-[11px] text-black/40 break-words">
                    Valid: {promo.valid_from ? new Date(promo.valid_from).toLocaleDateString() : "Anytime"}
                    {promo.valid_from && promo.valid_to ? " - " : ""}
                    {promo.valid_to ? new Date(promo.valid_to).toLocaleDateString() : ""}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => togglePromoFeatured(promo)}
                  disabled={editLoading}
                  className={`h-8 px-2 rounded-[3px] text-[11px] font-semibold transition-colors disabled:opacity-60 ${
                    promo.is_featured
                      ? "bg-[#fff7ed] text-[#b54708] border border-[#b54708]/20"
                      : "border border-black/10 text-black/60 hover:bg-black/5"
                  }`}
                  title={promo.is_featured ? "Unfeature" : "Feature"}
                >
                  {promo.is_featured ? "★" : "☆"}
                </button>
                <button
                  type="button"
                  onClick={() => startEditPromo(promo)}
                  className="h-8 px-3 rounded-[3px] border border-black/10 text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPromoToDelete(promo.id)}
                  disabled={editLoading}
                  className="h-8 px-2 rounded-[3px] border border-[#b42318]/20 text-[12px] text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
