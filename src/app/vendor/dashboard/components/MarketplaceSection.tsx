import React, { useState, useEffect } from "react";
import { MarketplaceItem } from "../types";
import { clampPct, clampZoom } from "../utils";
import { Field } from "./DashboardSections";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";

export function MarketplaceItemModal({
  vendorId,
  open,
  item,
  isNew,
  onCancel,
  onSave,
  onDelete,
}: {
  vendorId?: number;
  open: boolean;
  item: MarketplaceItem | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (payload: {
    title: string;
    summary: string | null;
    price: number | null;
    price_text: string | null;
    image_url: string | null;
    image_focus_x: number | null;
    image_focus_y: number | null;
    image_zoom: number | null;
    is_active: boolean;
  }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [price, setPrice] = useState(String(item?.price ?? ""));
  const [priceText, setPriceText] = useState(item?.price_text ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [focusX, setFocusX] = useState(() => clampPct(Number(item?.image_focus_x ?? 50)));
  const [focusY, setFocusY] = useState(() => clampPct(Number(item?.image_focus_y ?? 50)));
  const [zoom, setZoom] = useState(() => clampZoom(Number(item?.image_zoom ?? 1)));
  const [cropperOpen, setCropperOpen] = useState(false);

  const [prevItem, setPrevItem] = useState<MarketplaceItem | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);

  if (item !== prevItem || open !== prevOpen) {
    setPrevItem(item);
    setPrevOpen(open);
    setTitle(item?.title ?? "");
    setSummary(item?.summary ?? "");
    setPrice(String(item?.price ?? ""));
    setPriceText(item?.price_text ?? "");
    setImageUrl(item?.image_url ?? "");
    setIsActive(item?.is_active ?? true);
    setFocusX(clampPct(Number(item?.image_focus_x ?? 50)));
    setFocusY(clampPct(Number(item?.image_focus_y ?? 50)));
    setZoom(clampZoom(Number(item?.image_zoom ?? 1)));
    setCropperOpen(false);
  }

  if (!open) return null;

  const priceNum = price.trim().length > 0 ? Number(price) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30 shrink-0">
          <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c]">{isNew ? "Add Marketplace Item" : "Edit Marketplace Item"}</h2>
          <p className="mt-1 text-[12px] text-black/45">List your products or services for couples to discover.</p>
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
            </div>
          ) : null}

          <Field label="Item Title">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding Photography Package"
            />
          </Field>

          <Field label="Short Summary">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe the item or package"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Price (Number)">
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 50000"
              />
            </Field>
            <Field label="Price Text (Optional)">
              <input
                type="text"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="e.g. Starting at ₱50,000"
              />
            </Field>
          </div>

          <div className="pt-2">
            <ImageUploadDropzone
              bucket="promo-assets"
              folder="marketplace"
              entityId={vendorId?.toString()}
              label="Cover Image"
              existingUrl={imageUrl}
              onUploadComplete={(res) => setImageUrl(res.url)}
              onClear={() => setImageUrl("")}
            />
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
              <span className="text-[13px] font-bold text-black/50 group-hover:text-black/70 transition-colors">{isActive ? "Item is Active" : "Item is Hidden"}</span>
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
                Delete Item
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
                  price: priceNum,
                  price_text: priceText.trim() ? priceText.trim() : null,
                  image_url: imageUrl.trim() ? imageUrl.trim() : null,
                  image_focus_x: imageUrl.trim() ? clampPct(focusX) : null,
                  image_focus_y: imageUrl.trim() ? clampPct(focusY) : null,
                  image_zoom: imageUrl.trim() ? clampZoom(zoom) : null,
                  is_active: isActive,
                })
              }
              disabled={!title.trim() || priceNum === null}
              className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
            >
              {isNew ? "Add Item" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketplaceSection({
  vendorId,
  marketplaceItems,
  setEditingMarketplaceItemId,
  setMarketplaceItemModalOpen,
  marketplaceItemModalOpen,
  editingMarketplaceItemId,
  deleteMarketplaceItem,
  updateMarketplaceItem,
  createMarketplaceItem
}: {
  vendorId?: number;
  marketplaceItems: MarketplaceItem[];
  setEditingMarketplaceItemId: (v: number | null) => void;
  setMarketplaceItemModalOpen: (v: boolean) => void;
  marketplaceItemModalOpen: boolean;
  editingMarketplaceItemId: number | null;
  deleteMarketplaceItem: (id: number) => void;
  updateMarketplaceItem: (id: number, payload: any) => void;
  createMarketplaceItem: (payload: any) => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Marketplace Items</h2>
          <div className="mt-1 text-[12px] text-black/45">List products or packages for couples to view and save.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingMarketplaceItemId(null);
            setMarketplaceItemModalOpen(true);
          }}
          className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
        >
          + Add Item
        </button>
      </div>

      <div className="relative min-h-[200px]">
        <div className="p-6 grid gap-6">
          {marketplaceItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">Build Your Catalog</div>
              <div className="text-[13px] text-black/40 max-w-xs mx-auto">Add your products or packages to allow couples to discover your offerings.</div>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#a67c52]/20 hover:scrollbar-thumb-[#a67c52]/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 pb-8">
                {marketplaceItems.map((item) => (
                  <div key={item.id} className="group relative bg-white rounded-lg border border-black/[0.06] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="flex h-full">
                      {item.image_url ? (
                        <div className="w-32 shrink-0 relative overflow-hidden border-r border-dashed border-black/[0.1] bg-[#fcfbf9]">
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-110"
                            style={{
                              transformOrigin: `${clampPct(Number(item.image_focus_x ?? 50))}% ${clampPct(Number(item.image_focus_y ?? 50))}%`,
                            }}
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                        </div>
                      ) : (
                        <div className="w-32 shrink-0 bg-[#a67c52]/5 flex items-center justify-center border-r border-dashed border-black/[0.1]">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1" className="h-10 w-10 opacity-30">
                            <path d="M20 12V8H4v4m16 0v4H4v-4m16 0h1m-17 0H3" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a67c52]">Marketplace</div>
                            <div className={`h-2 w-2 rounded-full ${item.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-black/10"}`} title={item.is_active ? "Active" : "Inactive"} />
                          </div>
                          <h4 className="text-[15px] font-serif font-bold text-[#2c2c2c] leading-snug line-clamp-2 mb-1 group-hover:text-[#a67c52] transition-colors">{item.title}</h4>
                          {item.summary && <p className="text-[12px] text-black/45 line-clamp-2 leading-relaxed">{item.summary}</p>}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-[14px] font-black text-[#a67c52]">
                              {item.price_text ? item.price_text : `₱${item.price.toLocaleString()}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMarketplaceItemId(item.id);
                                setMarketplaceItemModalOpen(true);
                              }}
                              className="h-8 w-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                              title="Edit Item"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MarketplaceItemModal
        vendorId={vendorId}
        open={marketplaceItemModalOpen}
        item={editingMarketplaceItemId ? marketplaceItems.find((p) => p.id === editingMarketplaceItemId) ?? null : null}
        isNew={!editingMarketplaceItemId}
        onCancel={() => {
          setMarketplaceItemModalOpen(false);
          setEditingMarketplaceItemId(null);
        }}
        onDelete={
          editingMarketplaceItemId
            ? () => {
              const id = editingMarketplaceItemId;
              setMarketplaceItemModalOpen(false);
              setEditingMarketplaceItemId(null);
              void deleteMarketplaceItem(id);
            }
            : undefined
        }
        onSave={(payload) => {
          if (editingMarketplaceItemId) {
            void updateMarketplaceItem(editingMarketplaceItemId, payload);
          } else {
            void createMarketplaceItem(payload);
          }
          setMarketplaceItemModalOpen(false);
          setEditingMarketplaceItemId(null);
        }}
      />
    </section>
  );
}
