"use client";

import { useEffect, useState } from "react";
import CoverCropperModal from "./CoverCropperModal";
import { clampPct, clampZoom, type VendorPromo } from "./types";

type PromoModalProps = {
  open: boolean;
  promo: VendorPromo | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (payload: {
    title: string;
    summary: string | null;
    terms: string | null;
    valid_from: string | null;
    valid_to: string | null;
    discount_percentage: number | null;
    image_url: string | null;
    image_focus_x: number | null;
    image_focus_y: number | null;
    image_zoom: number | null;
    is_active: boolean;
  }) => void;
  onDelete?: () => void;
};

export default function PromoModal({
  open,
  promo,
  isNew,
  onCancel,
  onSave,
  onDelete,
}: PromoModalProps) {
  const [title, setTitle] = useState(promo?.title ?? "");
  const [summary, setSummary] = useState(promo?.summary ?? "");
  const [terms, setTerms] = useState(promo?.terms ?? "");
  const [validFrom, setValidFrom] = useState(promo?.valid_from ?? "");
  const [validTo, setValidTo] = useState(promo?.valid_to ?? "");
  const [discount, setDiscount] = useState(String(promo?.discount_percentage ?? ""));
  const [imageUrl, setImageUrl] = useState(promo?.image_url ?? "");
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);
  const [focusX, setFocusX] = useState(() => clampPct(Number(promo?.image_focus_x ?? 50)));
  const [focusY, setFocusY] = useState(() => clampPct(Number(promo?.image_focus_y ?? 50)));
  const [zoom, setZoom] = useState(() => clampZoom(Number(promo?.image_zoom ?? 1)));
  const [cropperOpen, setCropperOpen] = useState(false);

  useEffect(() => {
    setTitle(promo?.title ?? "");
    setSummary(promo?.summary ?? "");
    setTerms(promo?.terms ?? "");
    setValidFrom(promo?.valid_from ?? "");
    setValidTo(promo?.valid_to ?? "");
    setDiscount(String(promo?.discount_percentage ?? ""));
    setImageUrl(promo?.image_url ?? "");
    setIsActive(promo?.is_active ?? true);
    setFocusX(clampPct(Number(promo?.image_focus_x ?? 50)));
    setFocusY(clampPct(Number(promo?.image_focus_y ?? 50)));
    setZoom(clampZoom(Number(promo?.image_zoom ?? 1)));
    setCropperOpen(false);
  }, [promo, open]);

  if (!open) return null;

  const discountNum = discount.trim().length > 0 ? Number(discount) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">{isNew ? "Add promo" : "Edit promo"}</div>
          <div className="mt-1 text-[12px] text-black/45">Add a title, details, and optional validity dates.</div>
        </div>

        <div className="p-4 grid gap-4">
          {imageUrl.trim() ? (
            <div className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
              <div className="w-full aspect-[3/4] relative bg-[#fcfbf9]">
                <img
                  src={imageUrl.trim()}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none"
                  style={{ transformOrigin: `${focusX}% ${focusY}%`, transform: `scale(${zoom})` }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-[12px] font-semibold text-black/55">Image preview</div>
                <button
                  type="button"
                  onClick={() => setCropperOpen(true)}
                  className="h-8 px-2 rounded-[3px] border border-black/10 bg-white text-[11px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                >
                  Adjust crop
                </button>
              </div>
            </div>
          ) : null}

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Title</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10% off for March bookings"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Summary (optional)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Terms (optional)</span>
            <textarea
              className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Promo terms..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid from (optional)</span>
              <input
                type="date"
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid to (optional)</span>
              <input
                type="date"
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Discount % (optional)</span>
              <input
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Image URL (optional)</span>
              <input
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          {imageUrl.trim() ? (
            <CoverCropperModal
              open={cropperOpen}
              imageUrl={imageUrl.trim()}
              initialFocusX={focusX}
              initialFocusY={focusY}
              initialZoom={zoom}
              minZoom={1}
              maxZoom={3}
              onCancel={() => setCropperOpen(false)}
              onSave={(next) => {
                setFocusX(clampPct(Number(next.focusX)));
                setFocusY(clampPct(Number(next.focusY)));
                setZoom(clampZoom(Number(next.zoom)));
                setCropperOpen(false);
              }}
            />
          ) : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-black/20"
            />
            <span className="text-[12px] font-semibold text-black/60">Active</span>
          </label>

          <div className="flex justify-between pt-2">
            <div>
              {!isNew && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-9 px-4 rounded-[3px] border border-[#b42318]/20 bg-white text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  onSave({
                    title: title.trim(),
                    summary: summary.trim() ? summary.trim() : null,
                    terms: terms.trim() ? terms.trim() : null,
                    valid_from: validFrom.trim() ? validFrom.trim() : null,
                    valid_to: validTo.trim() ? validTo.trim() : null,
                    discount_percentage: discountNum !== null && Number.isFinite(discountNum) ? Math.round(discountNum) : null,
                    image_url: imageUrl.trim() ? imageUrl.trim() : null,
                    image_focus_x: imageUrl.trim() ? clampPct(focusX) : null,
                    image_focus_y: imageUrl.trim() ? clampPct(focusY) : null,
                    image_zoom: imageUrl.trim() ? clampZoom(zoom) : null,
                    is_active: isActive,
                  })
                }
                disabled={!title.trim()}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
