import React from "react";

export function ProfessionalStatusSection({
  editForm,
  setEditForm
}: {
  editForm: any;
  setEditForm: (v: any) => void;
}) {
  const checkedStatuses = (editForm.document_verified ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const handleCheckboxChange = (status: string, checked: boolean) => {
    let nextStatuses = [...checkedStatuses];
    if (checked) {
      // If checking "verified", uncheck "verification_in_progress"
      if (status === "verified") {
        nextStatuses = nextStatuses.filter(s => s !== "verification_in_progress");
      }
      // If checking "verification_in_progress", uncheck "verified"
      if (status === "verification_in_progress") {
        nextStatuses = nextStatuses.filter(s => s !== "verified");
      }
      if (!nextStatuses.includes(status)) {
        nextStatuses.push(status);
      }
    } else {
      nextStatuses = nextStatuses.filter(s => s !== status);
    }
    setEditForm((f: any) => ({
      ...f,
      document_verified: nextStatuses.join(",") || null
    }));
  };

  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
        Professional Status
      </div>
      <div className="grid gap-3">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* VERIFIED */}
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-black/10 bg-[#fafafa] cursor-pointer hover:border-[#a67c52]/30 transition-colors group">
            <input
              type="checkbox"
              name="professional_status_verified"
              checked={checkedStatuses.includes("verified")}
              onChange={(e) => handleCheckboxChange("verified", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#a67c52] rounded-[3px]"
            />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">VERIFIED</div>
              <div className="text-[11px] text-black/50 mt-0.5">With DTI / SEC / BIR docs submitted</div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium flex items-center gap-1" style={{ color: '#60a5fa' }}>
                <div className="relative h-3.5 w-3.5" style={{ color: '#60a5fa' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 h-full w-full p-0.5">
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                Note: Shows Blue check badge
              </div>
            </div>
          </label>

          {/* Verification In Progress */}
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-black/10 bg-[#fafafa] cursor-pointer hover:border-[#a67c52]/30 transition-colors group">
            <input
              type="checkbox"
              name="professional_status_in_progress"
              checked={checkedStatuses.includes("verification_in_progress")}
              onChange={(e) => handleCheckboxChange("verification_in_progress", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#a67c52] rounded-[3px]"
            />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Verification In Progress</div>
              <div className="text-[11px] text-black/50 mt-0.5">Awaiting docs (up to 1 month from registration)</div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium flex items-center gap-1" style={{ color: '#ffc067' }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Note: Shows Pastel Orange text status
              </div>
            </div>
          </label>

          {/* Community Recognized */}
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-black/10 bg-[#fafafa] cursor-pointer hover:border-[#a67c52]/30 transition-colors group">
            <input
              type="checkbox"
              name="professional_status_community"
              checked={checkedStatuses.includes("community_recognized")}
              onChange={(e) => handleCheckboxChange("community_recognized", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#a67c52] rounded-[3px]"
            />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Community Recognized</div>
              <div className="text-[11px] text-black/50 mt-0.5">Known in the community as legit/trustworthy</div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium flex items-center gap-1" style={{ color: '#ffc9d7' }}>
                <div className="relative h-3.5 w-3.5" style={{ color: '#ffc9d7' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 h-full w-full p-0.5">
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                Note: Shows Pink check badge
              </div>
            </div>
          </label>

          {/* Established Professional */}
          {(() => {
            const currentYear = new Date().getFullYear();
            const establishedYear = editForm.year_established ? Number(editForm.year_established) : null;
            const age = establishedYear ? (currentYear - establishedYear) : null;
            const is10YearsOld = age !== null && age >= 10;

            return (
              <label className="flex items-start gap-3 p-3 rounded-[3px] border border-black/10 bg-[#fafafa] cursor-not-allowed transition-colors group relative overflow-hidden">
                <input
                  type="checkbox"
                  name="professional_status_established"
                  checked={is10YearsOld}
                  disabled
                  className="mt-1 h-4 w-4 accent-[#4ade80] rounded-[3px] cursor-not-allowed opacity-75"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-[#2c2c2c] opacity-75">Established Professional</span>
                    {is10YearsOld ? (
                      <span className="text-[9px] font-extrabold tracking-wider bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-[3px] uppercase border border-green-500/20">
                        Auto-Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold tracking-wider bg-black/5 text-black/40 px-1.5 py-0.5 rounded-[3px] uppercase border border-black/10">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-black/50 mt-1">
                    At least 10 years in business (based on Year Established)
                  </div>
                  <div className="mt-2 text-[10px] font-medium flex flex-col gap-1">
                    <span className="text-[#a67c52] font-semibold">
                      {establishedYear 
                        ? `Business is ${age} year${age === 1 ? "" : "s"} old (Established ${establishedYear})`
                        : "Year Established not specified yet"}
                    </span>
                    <span className="text-black/40 text-[9px] mt-0.5">
                      💡 Locked. Automatically calculated from Year Established input.
                    </span>
                  </div>
                </div>
              </label>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
