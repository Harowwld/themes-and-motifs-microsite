import React from "react";
import { Spinner } from "./DashboardSections";
import { Theme } from "../types";

export function CategoriesSection({
  themes,
  setThemes,
  allThemes,
  themeInput,
  setThemeInput,
  saving,
  saveThemes
}: {
  themes: Theme[];
  setThemes: any;
  allThemes: Theme[];
  themeInput: string;
  setThemeInput: (v: string) => void;
  saving: boolean;
  saveThemes: () => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
        <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Service Categories</h2>
        <div className="mt-1 text-[12px] text-black/45">Select the categories that best describe your business.</div>
      </div>
      <div className="p-6">
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <div key={t.id} className="group flex items-center gap-2 rounded-lg bg-[#a67c52]/10 px-3 py-1.5 text-[12px] font-bold text-[#a67c52] transition-all duration-300 hover:bg-[#a67c52] hover:text-white">
                {t.name}
                <button
                  type="button"
                  onClick={() => setThemes((prev: Theme[]) => prev.filter((x) => x.id !== t.id))}
                  className="text-[16px] leading-none opacity-40 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search or add category..."
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
            />
            {themeInput.trim() && (
              <div className="absolute top-full left-0 z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-lg border border-black/[0.08] bg-white p-2 shadow-xl backdrop-blur-md">
                {allThemes
                  .filter((t) => t.name.toLowerCase().includes(themeInput.toLowerCase()))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="w-full rounded-md px-4 py-2.5 text-left text-[13px] font-medium text-[#2c2c2c] transition-colors hover:bg-[#a67c52]/5 hover:text-[#a67c52]"
                      onClick={() => {
                        if (!themes.find((x) => x.id === t.id)) {
                          setThemes((prev: Theme[]) => [...prev, t]);
                        }
                        setThemeInput("");
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                {!allThemes.some((t) => t.name.toLowerCase() === themeInput.trim().toLowerCase()) && (
                  <button
                    type="button"
                    className="w-full rounded-md px-4 py-2.5 text-left text-[13px] font-bold text-[#a67c52] transition-colors hover:bg-[#a67c52]/5"
                    onClick={() => {
                      const newT = { id: Math.random(), name: themeInput.trim(), slug: themeInput.trim().toLowerCase().replace(/\s+/g, "-") };
                      setThemes((prev: Theme[]) => [...prev, newT]);
                      setThemeInput("");
                    }}
                  >
                    + Add "{themeInput.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end pt-4 border-t border-black/[0.03]">
          <button type="button" onClick={saveThemes} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] transition-all duration-300 disabled:opacity-60">
            <span className="inline-flex items-center gap-2">
              {saving ? <Spinner className="text-white/90" /> : null}
              <span>{saving ? "Saving Categories…" : "Update Service Categories"}</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
