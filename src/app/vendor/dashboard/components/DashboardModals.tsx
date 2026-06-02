import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { Field } from "./DashboardSections";
import { VendorPromo, VendorImage, VendorVideo } from "../types";
import { clampPct, clampZoom } from "../utils";
import { MultiImageUploadManager } from "@/components/MultiImageUploadManager";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { cn } from "@/lib/utils";


export function LogoModal({
  open,
  logoUrl,
  onCancel,
  onSave,
}: {
  open: boolean;
  logoUrl: string;
  onCancel: () => void;
  onSave: (url: string) => void;
}) {
  const [url, setUrl] = useState(logoUrl);

  useEffect(() => {
    setUrl(logoUrl);
  }, [logoUrl, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
          <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">Brand Logo</h2>
          <p className="mt-1 text-[12px] text-black/45">Enter the URL of your official business logo.</p>
        </div>
        <div className="p-8 grid gap-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-lg border border-black/[0.08] bg-white overflow-hidden flex items-center justify-center shadow-inner">
              {url ? (
                <img src={url} alt="Logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="h-full w-full bg-[#fafafa] flex items-center justify-center text-[11px] font-bold text-black/30 uppercase tracking-widest">
                  No Logo
                </div>
              )}
            </div>
          </div>
          <Field label="Logo URL">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(url)}
              className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300"
            >
              Save Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromoModal({
  open,
  promo,
  isNew,
  onCancel,
  onSave,
  onDelete,
}: {
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
}) {
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

  const [prevPromo, setPrevPromo] = useState<VendorPromo | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);

  if (promo !== prevPromo || open !== prevOpen) {
    setPrevPromo(promo);
    setPrevOpen(open);
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
  }

  if (!open) return null;

  const discountNum = discount.trim().length > 0 ? Number(discount) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30 shrink-0">
          <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c]">{isNew ? "Create New Promo" : "Edit Promo Details"}</h2>
          <p className="mt-1 text-[12px] text-black/45">Define your special offer to attract more couples.</p>
        </div>

        <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {imageUrl.trim() ? (
            <div className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
              <div className="w-full aspect-[4/3] relative bg-[#fafafa]">
                <img
                  src={imageUrl.trim()}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-500"
                  style={{ transformOrigin: `${focusX}% ${focusY}%`, transform: `scale(${zoom})` }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between bg-[#fafafa]/50">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#a67c52]">Cover Preview</div>
                <button
                  type="button"
                  onClick={() => setCropperOpen(true)}
                  className="h-8 px-4 rounded-lg border border-[#a67c52]/30 bg-white text-[11px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                >
                  Adjust Framing
                </button>
              </div>
            </div>
          ) : null}

          <Field label="Promo Title">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 15% Early Bird Discount"
            />
          </Field>

          <Field label="Short Summary">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe the offer"
            />
          </Field>

          <Field label="Full Terms & Conditions">
            <textarea
              className="min-h-24 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 py-3 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200 resize-none"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Detailed terms of the promo..."
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Starts On">
              <input
                type="date"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </Field>
            <Field label="Expires On">
              <input
                type="date"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Discount %">
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g. 15"
              />
            </Field>
            <Field label="Cover Image URL">
              <input
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-[#a67c52]" : "bg-black/10"}`} />
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isActive ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-[13px] font-bold text-black/50 group-hover:text-black/70 transition-colors">{isActive ? "Promo is Active" : "Promo is Hidden"}</span>
            </label>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-black/[0.04] bg-[#fafafa]/30 flex justify-between shrink-0">
          <div>
            {!isNew && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="h-11 px-6 rounded-lg border border-red-100 bg-white text-[13px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                Delete Promo
              </button>
            ) : null}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
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
              className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
            >
              {isNew ? "Create Promo" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotoModal({
  open,
  photo,
  isNew,
  onCancel,
  onSave,
  onDelete
}: {
  open: boolean;
  photo: VendorImage | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (photos: VendorImage[]) => void;
  onDelete?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(photo?.image_url ?? "");
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [isCover, setIsCover] = useState(photo?.is_cover ?? false);

  useEffect(() => {
    if (photo) {
      setImageUrl(photo.image_url);
      setCaption(photo.caption ?? "");
      setIsCover(Boolean(photo.is_cover));
    } else {
      setImageUrl("");
      setCaption("");
      setIsCover(false);
    }
  }, [photo, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
      <div className={cn(
        "w-full bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 transform scale-100 flex flex-col max-h-[90vh]",
        isNew ? "max-w-4xl" : "max-w-md"
      )}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-black/[0.01] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[#2c2c2c]">
              {isNew ? "Add Portfolio Photos" : "Edit Photo Details"}
            </h2>
            <p className="text-xs text-black/40 mt-0.5">
              {isNew 
                ? "Upload multiple images and add captions to showcase your work." 
                : "Update the caption or cover status for this photo."}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">
          {isNew ? (
            /* Multi-Upload View */
            <MultiImageUploadManager
              bucket="vendor-assets"
              folder="gallery"
              maxFiles={20}
              onUploadsComplete={(results) => {
                const newPhotos: VendorImage[] = results.map((res, idx) => ({
                  image_url: res.url,
                  caption: res.caption,
                  is_cover: false,
                  display_order: idx + 1,
                }));
                onSave(newPhotos);
              }}
              onCancel={onCancel}
            />
          ) : (
            /* Single Edit View */
            <div className="space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-black/10 bg-black/5 shadow-inner group">
                <img 
                  src={proxiedImageUrl(imageUrl) ?? imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {isCover && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#027a48] text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COVER PHOTO
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
                    Caption
                  </label>
                  <textarea
                    className="w-full min-h-[100px] rounded-xl border border-black/10 bg-black/[0.01] px-4 py-3 text-sm focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all outline-none resize-none"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tell a story about this photo..."
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-black/10 bg-black/[0.01] cursor-pointer hover:border-[#a67c52]/30 hover:bg-[#a67c52]/5 transition-all group">
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                    isCover ? "bg-[#a67c52] border-[#a67c52]" : "border-black/20 bg-white group-hover:border-[#a67c52]"
                  )}>
                    {isCover && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-black/70">Use as portfolio cover photo</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Photo</span>
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-5 rounded-xl border border-black/10 bg-white text-sm font-semibold text-black/70 hover:bg-black/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onSave([{ 
                      image_url: imageUrl, 
                      caption, 
                      is_cover: isCover, 
                      display_order: photo?.display_order ?? 1 
                    }])}
                    disabled={!imageUrl.trim()}
                    className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#a67c52] text-white text-sm font-semibold hover:bg-[#8e6a46] shadow-md shadow-[#a67c52]/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:translate-y-0"
                  >
                    <span>Save Changes</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoModal({
  open,
  video,
  isNew,
  onCancel,
  onSave,
  onDelete
}: {
  open: boolean;
  video: VendorVideo | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (video: { title: string; video_url: string }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [url, setUrl] = useState(video?.video_url ?? "");

  useEffect(() => {
    setTitle(video?.title ?? "");
    setUrl(video?.video_url ?? "");
  }, [video, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
          <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">{isNew ? "Add Video Highlight" : "Edit Video Details"}</h2>
          <p className="mt-1 text-[12px] text-black/45">Embed a video from YouTube or Vimeo.</p>
        </div>

        <div className="p-8 grid gap-6">
          <Field label="Video Title">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Wedding Cinematic Highlight"
            />
          </Field>

          <Field label="Video URL">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>

          <div className="flex justify-between gap-3 pt-2">
            <div>
              {!isNew && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-11 px-6 rounded-lg border border-red-100 bg-white text-[13px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSave({ title: title.trim(), video_url: url.trim() })}
                disabled={!title.trim() || !url.trim()}
                className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {isNew ? "Add Video" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoverCropperModal({
  open,
  imageUrl,
  initialFocusX,
  initialFocusY,
  initialZoom,
  minZoom = 1,
  maxZoom = 3,
  onCancel,
  onSave,
}: {
  open: boolean;
  imageUrl: string;
  initialFocusX: number;
  initialFocusY: number;
  initialZoom: number;
  minZoom?: number;
  maxZoom?: number;
  onCancel: () => void;
  onSave: (next: { focusX: number; focusY: number; zoom: number }) => void;
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const focusXRef = React.useRef(50);
  const focusYRef = React.useRef(50);
  const zoomRef = React.useRef(1);

  const [focusX, setFocusX] = useState(() => clampPct(initialFocusX));
  const [focusY, setFocusY] = useState(() => clampPct(initialFocusY));
  const [zoom, setZoom] = useState(() => clampZoom(initialZoom));

  useEffect(() => {
    focusXRef.current = focusX;
  }, [focusX]);

  useEffect(() => {
    focusYRef.current = focusY;
  }, [focusY]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (!open) return;
    setFocusX(clampPct(initialFocusX));
    setFocusY(clampPct(initialFocusY));
    setZoom(clampZoom(initialZoom));
  }, [open, initialFocusX, initialFocusY, initialZoom]);

  const transformOrigin = React.useMemo(() => `${focusX}% ${focusY}%`, [focusX, focusY]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;

    const drag = {
      active: false,
      startX: 0,
      startY: 0,
      baseFocusX: 50,
      baseFocusY: 50,
    };

    const onPointerDown = (e: PointerEvent) => {
      drag.active = true;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.baseFocusX = focusXRef.current;
      drag.baseFocusY = focusYRef.current;

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      const z = zoomRef.current;
      const denomX = Math.max(1, rect.width * z);
      const denomY = Math.max(1, rect.height * z);
      const nextX = drag.baseFocusX - (dx / denomX) * 100;
      const nextY = drag.baseFocusY - (dy / denomY) * 100;

      setFocusX(clampPct(nextX));
      setFocusY(clampPct(nextY));
    };

    const onPointerUp = () => {
      drag.active = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const step = 0.08;
      setZoom((z) => clampZoom(z + (delta > 0 ? -step : step)));
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel as any);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg border border-black/20 bg-white shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Adjust cover</div>
            <div className="mt-1 text-[12px] text-black/55">
              Drag to reposition. Scroll or use +/- to zoom.
            </div>
          </div>

          <div className="p-5 grid gap-4">
            <div className="flex justify-center">
              <div
                ref={viewportRef}
                className="relative w-full max-w-[300px] aspect-[3/4] rounded-lg border border-black/20 bg-[#f3f4f6] overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <img
                  src={imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none"
                  style={{ transformOrigin, transform: `scale(${zoom})` }}
                  draggable={false}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-black/15 bg-white text-[16px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => setZoom((z) => clampZoom(z - 0.1))}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <div className="text-[12px] font-semibold text-black/60 min-w-16 text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-black/15 bg-white text-[16px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => setZoom((z) => clampZoom(z + 0.1))}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 px-3 rounded-lg border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => {
                    setFocusX(50);
                    setFocusY(50);
                    setZoom(1);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="h-9 px-4 rounded-lg bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46]"
                  onClick={() => onSave({ focusX, focusY, zoom })}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
