import React from "react";
import { PromoModal } from "./DashboardModals";
import { VendorPromo } from "../types";
import { clampPct } from "../utils";

export function PromoSection({
  vendorId,
  promos,
  isPremium,
  setEditingPromoId,
  setPromoModalOpen,
  promoModalOpen,
  editingPromoId,
  deletePromo,
  updatePromo,
  createPromo
}: {
  vendorId?: number;
  promos: VendorPromo[];
  isPremium: boolean;
  setEditingPromoId: (v: number | null) => void;
  setPromoModalOpen: (v: boolean) => void;
  promoModalOpen: boolean;
  editingPromoId: number | null;
  deletePromo: (id: number) => void;
  updatePromo: (id: number, payload: any) => void;
  createPromo: (payload: any) => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Exclusive Promos</h2>
          <div className="mt-1 text-[12px] text-black/45">Create attractive deals to convert more inquiries.</div>
        </div>
        {isPremium && (
          <button
            type="button"
            onClick={() => {
              setEditingPromoId(null);
              setPromoModalOpen(true);
            }}
            className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
          >
            + Add Promo
          </button>
        )}
      </div>

      <div className="relative min-h-[200px]">
        <div className={isPremium ? "p-6 grid gap-6" : "p-6 grid gap-6 opacity-30 pointer-events-none select-none filter blur-[2px]"}>
          {promos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                  <path d="M15 5l-1.79-1.79A2 2 0 0 0 11.79 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-2z" />
                </svg>
              </div>
              <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">Grow Your Bookings</div>
              <div className="text-[13px] text-black/40 max-w-xs mx-auto">Promos are a great way to attract early birds or fill up remaining slots.</div>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#a67c52]/20 hover:scrollbar-thumb-[#a67c52]/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 pb-8">
                {promos.map((p) => (
                  <div key={p.id} className="group relative bg-white rounded-lg border border-black/[0.06] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-1/2 -left-2 h-4 w-4 rounded-full bg-[#fafafa] border border-black/[0.06] z-10" />
                    <div className="absolute top-1/2 -right-2 h-4 w-4 rounded-full bg-[#fafafa] border border-black/[0.06] z-10" />

                    <div className="flex h-full">
                      {p.image_url ? (
                        <div className="w-32 shrink-0 relative overflow-hidden border-r border-dashed border-black/[0.1] bg-[#fcfbf9]">
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-110"
                            style={{
                              transformOrigin: `${clampPct(Number(p.image_focus_x ?? 50))}% ${clampPct(Number(p.image_focus_y ?? 50))}%`,
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
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a67c52]">Official Promo</div>
                            <div className={`h-2 w-2 rounded-full ${p.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-black/10"}`} title={p.is_active ? "Active" : "Inactive"} />
                          </div>
                          <h4 className="text-[15px] font-serif font-bold text-[#2c2c2c] leading-snug line-clamp-2 mb-1 group-hover:text-[#a67c52] transition-colors">{p.title}</h4>
                          {p.summary && <p className="text-[12px] text-black/45 line-clamp-2 leading-relaxed">{p.summary}</p>}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {typeof p.discount_percentage === "number" ? (
                              <div className="px-2.5 py-1 rounded-lg bg-[#a67c52] text-white text-[12px] font-black shadow-lg shadow-[#a67c52]/20">
                                {p.discount_percentage}% OFF
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 rounded-lg bg-[#fafafa] border border-black/[0.08] text-[11px] font-bold text-[#a67c52]">
                                Special Deal
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPromoId(p.id);
                                setPromoModalOpen(true);
                              }}
                              className="h-8 w-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                              title="Edit Promo"
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

        {!isPremium ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/40 backdrop-blur-[1px] z-20">
            <div className="rounded-lg border border-black/[0.08] bg-white p-8 text-center shadow-2xl max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
              <div className="h-16 w-16 rounded-full bg-[#a67c52]/10 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                  <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                </svg>
              </div>
              <h3 className="font-serif text-[20px] font-bold text-[#2c2c2c] mb-2">Premium Feature</h3>
              <p className="text-[14px] text-black/45 mb-6 leading-relaxed">Boost your conversion rate by offering exclusive deals to couples. Upgrade to Premium to unlock Promos.</p>
              <button className="w-full h-12 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] transition-all duration-300">
                Upgrade to Premium
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <PromoModal
        vendorId={vendorId}
        open={promoModalOpen}
        promo={editingPromoId ? promos.find((p) => p.id === editingPromoId) ?? null : null}
        isNew={!editingPromoId}
        onCancel={() => {
          setPromoModalOpen(false);
          setEditingPromoId(null);
        }}
        onDelete={
          editingPromoId
            ? () => {
              const id = editingPromoId;
              setPromoModalOpen(false);
              setEditingPromoId(null);
              void deletePromo(id);
            }
            : undefined
        }
        onSave={(payload) => {
          if (editingPromoId) {
            void updatePromo(editingPromoId, payload);
          } else {
            void createPromo(payload);
          }
          setPromoModalOpen(false);
          setEditingPromoId(null);
        }}
      />
    </section>
  );
}
