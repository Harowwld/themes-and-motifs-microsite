import React from "react";
import { Spinner } from "./DashboardSections";
import { SocialPlatformOption, SOCIAL_PLATFORM_OPTIONS } from "../types";

export function SocialSection({
  socials,
  setSocials,
  socialPlatformChoices,
  setSocialPlatformChoices,
  socialCustomPlatforms,
  setSocialCustomPlatforms,
  saving,
  saveSocials,
  isPremium
}: {
  socials: Array<{ platform: string; url: string }>;
  setSocials: any;
  socialPlatformChoices: SocialPlatformOption[];
  setSocialPlatformChoices: any;
  socialCustomPlatforms: string[];
  setSocialCustomPlatforms: any;
  saving: boolean;
  saveSocials: () => void;
  isPremium: boolean;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Social Connections</h2>
          <div className="mt-1 text-[12px] text-black/45">Help couples find you on your other platforms.</div>
        </div>
        {!isPremium && (
          <span className="px-3 py-1 rounded-full bg-[#a67c52]/10 text-[#a67c52] text-[10px] font-black uppercase tracking-wider">Premium Only</span>
        )}
      </div>

      <div className="p-6 grid gap-6">
        <div className={isPremium ? "grid gap-4" : "grid gap-4 opacity-30 pointer-events-none grayscale"}>
          {socials.map((row, idx) => (
            <div key={idx} className="group flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#fafafa]/50 p-4 rounded-lg border border-black/[0.03] transition-all hover:bg-white hover:shadow-md hover:border-black/[0.08]">
              <div className="flex-shrink-0 w-full sm:w-32">
                <select
                  value={socialPlatformChoices[idx] || "facebook"}
                  onChange={(e) => {
                    const val = e.target.value as SocialPlatformOption;
                    setSocialPlatformChoices((prev: SocialPlatformOption[]) => {
                      const next = [...prev];
                      next[idx] = val;
                      return next;
                    });
                    if (val !== "other") {
                      setSocials((prev: any[]) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], platform: val };
                        return next;
                      });
                    }
                  }}
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[12px] font-bold text-[#2c2c2c] outline-none focus:border-[#a67c52] transition-colors"
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {socialPlatformChoices[idx] === "other" && (
                <div className="flex-shrink-0 w-full sm:w-32">
                  <input
                    placeholder="Platform name"
                    className="h-10 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[12px] font-bold text-[#2c2c2c] outline-none focus:border-[#a67c52] transition-colors"
                    value={socialCustomPlatforms[idx] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSocialCustomPlatforms((prev: string[]) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                      setSocials((prev: any[]) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], platform: val };
                        return next;
                      });
                    }}
                  />
                </div>
              )}

              <div className="flex-1 w-full">
                <input
                  type="url"
                  placeholder="Paste profile URL here..."
                  className="h-10 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] outline-none focus:border-[#a67c52] transition-colors"
                  value={row.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSocials((prev: any[]) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], url: val };
                      return next;
                    });
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSocials((prev: any[]) => prev.filter((_, i) => i !== idx));
                  setSocialPlatformChoices((prev: any[]) => prev.filter((_, i) => i !== idx));
                  setSocialCustomPlatforms((prev: any[]) => prev.filter((_, i) => i !== idx));
                }}
                className="h-9 w-9 rounded-full bg-white border border-black/[0.05] text-black/30 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
              >
                ×
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t border-black/[0.03]">
            <button
              type="button"
              onClick={() => {
                setSocials((rows: any) => [...rows, { platform: "facebook", url: "" }]);
                setSocialPlatformChoices((rows: any) => [...rows, "facebook"]);
              }}
              className="h-11 px-6 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
            >
              + Add Social Link
            </button>
            <button type="button" onClick={saveSocials} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] transition-all duration-300 disabled:opacity-60">
              <span className="inline-flex items-center gap-2">
                {saving ? <Spinner className="text-white/90" /> : null}
                <span>{saving ? "Saving Links…" : "Save Social Links"}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
