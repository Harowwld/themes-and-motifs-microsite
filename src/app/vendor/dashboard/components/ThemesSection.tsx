import React from "react";
import { Spinner } from "./DashboardSections";
import { Theme } from "../types";

export function ThemesSection({
  themes,
  setThemes,
  allThemes,
  saving,
  saveThemes
}: {
  themes: Theme[];
  setThemes: any;
  allThemes: Theme[];
  saving: boolean;
  saveThemes: () => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
        <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Themes</h2>
        <div className="mt-1 text-[12px] text-black/45">Select the themes that best describe your business. (Max 10)</div>
      </div>
      <div className="p-6">
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2.5">
            {allThemes.map((t) => {
              const isSelected = themes.some((x) => x.id === t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setThemes((prev: Theme[]) => prev.filter((x) => x.id !== t.id));
                    } else {
                      if (themes.length >= 10) {
                        return;
                      }
                      setThemes((prev: Theme[]) => [...prev, t]);
                    }
                  }}
                  className={`group relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 border flex items-center gap-2 cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/30 shadow-[0_4px_12px_rgba(124,58,237,0.1)]"
                      : "bg-[#fafafa]/50 text-black/40 border-black/[0.06] hover:border-[#a67c52]/40 hover:bg-white hover:text-[#a67c52] hover:shadow-sm"
                  }`}
                >
                  {t.name}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end pt-4 border-t border-black/[0.03]">
          <button 
            type="button" 
            onClick={saveThemes} 
            disabled={saving} 
            className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] transition-all duration-300 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <Spinner className="text-white/90" /> : null}
            <span>{saving ? "Saving Themes…" : "Update Themes"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
