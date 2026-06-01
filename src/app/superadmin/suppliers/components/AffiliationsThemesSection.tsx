import React from "react";
import { Affiliation, Theme } from "../hooks/useSuperadminVendors";

export function AffiliationsThemesSection({
  editAffiliations,
  setEditAffiliations,
  allAffiliations,
  affiliationInput,
  setAffiliationInput,
  editThemes,
  setEditThemes,
  allThemes
}: {
  editAffiliations: Affiliation[];
  setEditAffiliations: (v: any) => void;
  allAffiliations: Affiliation[];
  affiliationInput: string;
  setAffiliationInput: (v: string) => void;
  editThemes: Theme[];
  setEditThemes: (v: any) => void;
  allThemes: Theme[];
}) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
          Affiliations
        </div>

        <div className="flex flex-wrap gap-2">
          {editAffiliations.map((aff) => (
            <span
              key={aff.id}
              className="inline-flex items-center gap-1 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-2.5 py-1 text-[12px] text-black/70"
            >
              {aff.name}
              <button
                type="button"
                onClick={() => setEditAffiliations((prev: any) => prev.filter((a: any) => a.id !== aff.id))}
                className="ml-1 text-black/40 hover:text-[#b42318]"
              >
                ×
              </button>
            </span>
          ))}
          {editAffiliations.length === 0 && (
            <span className="text-[12px] text-black/50 italic">No affiliations added.</span>
          )}
        </div>

        <div className="grid gap-2">
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                if (!selectedId) return;
                const selected = allAffiliations.find((a) => a.id === selectedId);
                if (selected && !editAffiliations.some((a) => a.id === selected.id)) {
                  setEditAffiliations((prev: any) => [...prev, selected]);
                }
                e.target.value = "";
              }}
              className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="">Select existing affiliation...</option>
              {allAffiliations
                .filter((a) => !editAffiliations.some((ea) => ea.id === a.id))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              value={affiliationInput}
              onChange={(e) => setAffiliationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const name = affiliationInput.trim();
                  if (!name) return;
                  if (editAffiliations.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
                    setAffiliationInput("");
                    return;
                  }
                  const existing = allAffiliations.find(
                    (a) => a.name.toLowerCase() === name.toLowerCase()
                  );
                  if (existing) {
                    setEditAffiliations((prev: any) => [...prev, existing]);
                  } else {
                    const newAff: Affiliation = {
                      id: -Date.now(),
                      name,
                      slug: "",
                    };
                    setEditAffiliations((prev: any) => [...prev, newAff]);
                  }
                  setAffiliationInput("");
                }
              }}
              className="h-10 flex-1 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              placeholder="Or type custom affiliation and press Enter..."
            />
            <button
              type="button"
              onClick={() => {
                const name = affiliationInput.trim();
                if (!name) return;
                if (editAffiliations.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
                  setAffiliationInput("");
                  return;
                }
                const existing = allAffiliations.find(
                  (a) => a.name.toLowerCase() === name.toLowerCase()
                );
                if (existing) {
                  setEditAffiliations((prev: any) => [...prev, existing]);
                } else {
                  const newAff: Affiliation = {
                    id: -Date.now(),
                    name,
                    slug: "",
                  };
                  setEditAffiliations((prev: any) => [...prev, newAff]);
                }
                setAffiliationInput("");
              }}
              className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
          Themes
        </div>
        <div className="flex flex-wrap gap-2">
          {allThemes.map((theme) => {
            const isSelected = editThemes.some((t) => t.id === theme.id);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setEditThemes((prev: any) => prev.filter((t: any) => t.id !== theme.id));
                  } else {
                    setEditThemes((prev: any) => [...prev, theme]);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  isSelected
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-[#fcfbf9] text-black/60 border border-black/10 hover:bg-black/5"
                }`}
              >
                {isSelected && (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {theme.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
