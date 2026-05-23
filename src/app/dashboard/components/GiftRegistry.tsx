"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Trash2, ExternalLink, Sparkles, Plus, Check } from "lucide-react";
import { toast } from "@/lib/toast";
import { proxiedImageUrl } from "@/lib/imageSizes";

interface GiftRegistryProps {
  userId: string;
  supabase: any;
}

type SavedPromoItem = {
  promo_id: number;
  target_amount: number;
  contribution: number;
  created_at: string;
  promo: {
    id: number;
    title: string;
    summary: string | null;
    image_url: string | null;
    discount_percentage: number | null;
    vendor: {
      id: number;
      business_name: string;
      logo_url: string | null;
      slug: string;
    } | null;
  } | null;
};

export default function GiftRegistry({ userId, supabase }: GiftRegistryProps) {
  const [items, setItems] = useState<SavedPromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingTarget, setEditingTarget] = useState<{ [key: number]: string }>({});
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchRegistryItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("saved_promos")
        .select(`
          promo_id,
          target_amount,
          contribution,
          created_at,
          promo:promos (
            id,
            title,
            summary,
            image_url,
            discount_percentage,
            vendor:vendor_id (
              id,
              business_name,
              logo_url,
              slug
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group structure: promo can be an array if supabase relationships are not formatted as single
      const formattedItems = (data ?? []).map((item: any) => {
        const promoRaw = item.promo;
        let promo = promoRaw;
        if (Array.isArray(promoRaw)) {
          promo = promoRaw[0] ?? null;
        }
        if (promo && Array.isArray(promo.vendor)) {
          promo.vendor = promo.vendor[0] ?? null;
        }
        return {
          ...item,
          promo,
        };
      });

      setItems(formattedItems);

      // Initialize editing states
      const initialTargets: { [key: number]: string } = {};
      formattedItems.forEach((i: SavedPromoItem) => {
        initialTargets[i.promo_id] = String(i.target_amount);
      });
      setEditingTarget(initialTargets);
    } catch (err) {
      console.error("Error fetching registry items:", err);
      toast.error("Failed to load registry items.");
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchRegistryItems();
  }, [fetchRegistryItems]);

  const handleUpdateTarget = async (promoId: number) => {
    const targetVal = parseFloat(editingTarget[promoId]);
    if (isNaN(targetVal) || targetVal <= 0) {
      toast.error("Please enter a valid target amount.");
      return;
    }

    setUpdatingId(promoId);
    try {
      const { error } = await supabase
        .from("saved_promos")
        .update({ target_amount: targetVal })
        .eq("user_id", userId)
        .eq("promo_id", promoId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) => (i.promo_id === promoId ? { ...i, target_amount: targetVal } : i))
      );
      toast.success("Target amount updated!");
    } catch (err) {
      console.error("Error updating target amount:", err);
      toast.error("Failed to update target amount.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = (promoId: number) => {
    setRemovingId(promoId);
  };

  const confirmRemoveItem = async (promoId: number) => {
    try {
      const { error } = await supabase
        .from("saved_promos")
        .delete()
        .eq("user_id", userId)
        .eq("promo_id", promoId);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.promo_id !== promoId));
      toast.success("Item removed from registry.");
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const totalTarget = items.reduce((acc, item) => acc + item.target_amount, 0);
  const totalContributions = items.reduce((acc, item) => acc + item.contribution, 0);
  const overallPercent = totalTarget > 0 ? Math.min((totalContributions / totalTarget) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a68b6a]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registry Summary Panel */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#a68b6a]" />
              <h3 className="text-[16px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                Gift Registry Planner
              </h3>
            </div>
            <p className="text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              Couples can select items from the marketplace to build their wedding registry. Share your public microsite so guests can contribute cash or gift values.
            </p>
          </div>
          <a
            href="/promos"
            className="px-4 py-2 text-[12px] font-bold text-white bg-[#a68b6a] hover:bg-[#957a5c] rounded-lg shadow-sm hover:shadow transition-all font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            Browse Marketplace
          </a>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-black/[0.04]">
            <div className="p-4 bg-neutral-50 rounded-xl">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">Registry Items</span>
              <span className="text-[20px] font-extrabold text-[#2c2c2c] font-[family-name:var(--font-plus-jakarta)]">
                {items.length}
              </span>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">Total Target Value</span>
              <span className="text-[20px] font-extrabold text-[#2c2c2c] font-[family-name:var(--font-plus-jakarta)]">
                ₱{totalTarget.toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">Guest Contributions</span>
              <span className="text-[20px] font-extrabold text-emerald-600 font-[family-name:var(--font-plus-jakarta)]">
                ₱{totalContributions.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-5 space-y-1.5 select-none">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-400">
              <span>Overall Funding Progress</span>
              <span>{overallPercent.toFixed(0)}% Funded</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#a68b6a] to-[#957a5c] transition-all duration-500" style={{ width: `${overallPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 rounded-full bg-[#a68b6a]/10 text-[#a68b6a] flex items-center justify-center mx-auto shadow-inner">
            <Heart size={28} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-semibold text-[15px] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Your Wedding Registry is Empty
            </h4>
            <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
              Build your dream wedding registry by hearting and saving exclusive deals &amp; items from our Marketplace!
            </p>
          </div>
          <div>
            <a
              href="/promos"
              className="inline-flex px-5 py-2.5 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Go to Marketplace
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => {
            const promo = item.promo;
            if (!promo) return null;

            const coverUrl = proxiedImageUrl(promo.image_url);
            const vendor = promo.vendor;
            const percent = (item.contribution / item.target_amount) * 100;
            const isFullyFunded = item.contribution >= item.target_amount;

            return (
              <div
                key={item.promo_id}
                className="group relative rounded-2xl border border-black/5 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header info */}
                  <div className="flex gap-4 mb-4">
                    {/* Cover image thumbnail */}
                    <div className="h-16 w-16 rounded-xl border border-black/5 overflow-hidden shrink-0 bg-neutral-50 flex items-center justify-center">
                      {coverUrl ? (
                        <img src={coverUrl ?? undefined} alt={promo.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#a68b6a]/15 to-white" />
                      )}
                    </div>
                    {/* Vendor and Title */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {vendor?.logo_url && (
                          <img
                            src={proxiedImageUrl(vendor.logo_url) ?? undefined}
                            alt=""
                            className="h-4 w-4 rounded object-cover border border-black/5"
                          />
                        )}
                        <span className="text-[11px] font-bold text-[#a68b6a] uppercase tracking-wider truncate">
                          {vendor?.business_name ?? "Independent Supplier"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[13.5px] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mt-0.5 line-clamp-2 leading-tight">
                        {promo.title}
                      </h4>
                    </div>
                  </div>

                  {/* Funding Gauge */}
                  <div className="space-y-1 mb-5 select-none">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-400">
                      <span>Funded Ratio</span>
                      <span>₱{item.contribution.toLocaleString()} / ₱{item.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#a68b6a] to-[#957a5c] transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Adjust Target Value Form */}
                <div className="space-y-4 pt-4 border-t border-black/[0.04]">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Target Amount (₱)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={updatingId === item.promo_id}
                        value={editingTarget[item.promo_id] ?? ""}
                        onChange={(e) =>
                          setEditingTarget((prev) => ({ ...prev, [item.promo_id]: e.target.value }))
                        }
                        className="h-9 flex-1 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[12px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateTarget(item.promo_id)}
                        disabled={updatingId === item.promo_id || editingTarget[item.promo_id] === String(item.target_amount)}
                        className={`h-9 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0 ${
                          editingTarget[item.promo_id] === String(item.target_amount)
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "bg-[#a68b6a] hover:bg-[#957a5c] text-white"
                        }`}
                      >
                        <Check size={12} strokeWidth={2.5} />
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    {removingId === item.promo_id ? (
                      <div className="flex items-center justify-between gap-2 p-2 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-700 w-full">
                        <span>Remove this item?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => confirmRemoveItem(item.promo_id)}
                            className="font-bold hover:underline"
                          >
                            Yes, Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemovingId(null)}
                            className="hover:underline text-neutral-500 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <a
                          href={`/promos/${item.promo_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a68b6a] hover:text-[#957a5c] uppercase tracking-wider"
                        >
                          <span>View Deal Page</span>
                          <ExternalLink size={11} strokeWidth={2.5} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.promo_id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                          title="Remove from registry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
