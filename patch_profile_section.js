const fs = require('fs');
const path = '/Users/harold/Documents/Programming/themes-and-motifs-microsite/src/app/vendor/dashboard/components/ProfileSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// The block to replace:
const targetBlockStart = `<div className="mt-4 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">`;
const targetBlockEnd = `<LogoModal`;

const replacement = `
                <div className="mt-6 flex flex-col gap-6">
                  {/* Full-Width Storefront Header Preview */}
                  <div className="relative w-full rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm pointer-events-none">
                    <div className="h-40 sm:h-56 w-full relative overflow-hidden bg-black/5" style={{ background: "linear-gradient(135deg, rgba(166,139,106,0.2), rgba(166,139,106,0.05))" }}>
                      {cover?.image_url && (
                        <img
                          src={cover.image_url}
                          alt="Cover preview"
                          className="absolute inset-0 h-full w-full object-cover select-none"
                          style={{
                            transformOrigin: \`\${x}% \${y}%\`,
                            transform: \`scale(\${z})\`,
                          }}
                        />
                      )}
                    </div>
                    <div className="px-6 relative -mt-12 sm:-mt-16 pb-6">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                        {form.logo_url ? (
                          <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-white flex items-center justify-center text-[24px] font-bold text-[#a68b6a]">
                            {form.business_name?.charAt(0).toUpperCase() || "V"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-white p-4 border border-black/5 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="text-[12px] font-semibold text-black/70">Crop & Zoom Settings</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#a67c52]">Zoom: {Math.round(z * 100)}%</span>
                        <span className="h-1 w-1 rounded-full bg-black/10" />
                        <span className="text-[12px] text-black/40">Position: {x}% {y}%</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="h-10 px-6 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      onClick={() => setCropperOpen(true)}
                      disabled={!cover?.image_url}
                    >
                      Adjust Crop Position
                    </button>
                  </div>

                  {!cover?.image_url ? (
                    <div className="text-[12px] text-red-500/90 font-medium">
                      Please add a cover photo in the "Photos" section first.
                    </div>
                  ) : null}

                  {cover?.image_url ? (
                    <CoverCropperModal
                      open={cropperOpen}
                      imageUrl={cover.image_url}
                      initialFocusX={x}
                      initialFocusY={y}
                      initialZoom={z}
                      minZoom={1}
                      maxZoom={3}
                      onCancel={() => setCropperOpen(false)}
                      onSave={(next) => void saveCoverCrop(next)}
                    />
                  ) : null}

                  `;

const startIndex = content.indexOf(targetBlockStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(targetBlockEnd, startIndex);
  if (endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(path, newContent);
    console.log("Successfully replaced the block.");
  } else {
    console.log("Could not find the end block.");
  }
} else {
  console.log("Could not find the start block.");
}
