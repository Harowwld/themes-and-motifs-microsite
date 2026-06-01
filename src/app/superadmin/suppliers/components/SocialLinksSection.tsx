import React from "react";
import { VendorSocial } from "../hooks/useSuperadminSuppliers";

export function SocialLinksSection({
  editSocials,
  setEditSocials
}: {
  editSocials: VendorSocial[];
  setEditSocials: (v: any) => void;
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2 flex items-center justify-between">
        <span>Social Links</span>
        <button
          type="button"
          onClick={() => setEditSocials((s: any) => [...s, { platform: "", url: "" }])}
          className="text-[12px] text-[#6e4f33] hover:underline"
        >
          + Add link
        </button>
      </div>
      <div className="grid gap-3">
        {editSocials.map((s, idx) => (
          <div key={idx} className="grid gap-2 sm:grid-cols-[140px_1fr_auto] items-end">
            <select
              value={s.platform}
              onChange={(e) => {
                const newSocials = [...editSocials];
                newSocials[idx].platform = e.target.value;
                setEditSocials(newSocials);
              }}
              className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
            >
              <option value="">Platform</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="x">X (Twitter)</option>
              <option value="pinterest">Pinterest</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            <input
              value={s.url}
              onChange={(e) => {
                const newSocials = [...editSocials];
                newSocials[idx].url = e.target.value;
                setEditSocials(newSocials);
              }}
              className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => setEditSocials((soc: any) => soc.filter((_: any, i: number) => i !== idx))}
              className="h-9 px-2 rounded-[3px] border border-[#b42318]/20 text-[12px] text-[#b42318] hover:bg-[#b42318]/5"
            >
              ×
            </button>
          </div>
        ))}
        {editSocials.length === 0 && (
          <div className="text-[12px] text-black/50 italic">No social links added yet.</div>
        )}
      </div>
    </section>
  );
}
