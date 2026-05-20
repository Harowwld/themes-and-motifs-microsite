"use client";

import { useEffect, useState, useMemo } from "react";

interface OrphanFile {
  name: string;
  url: string;
}

interface ScheduleConfig {
  enabled: boolean;
  cron: string;
  limit: number;
  last_run?: {
    timestamp: string;
    status: "success" | "partial_error";
    deleted_count: number;
    total_orphans_found: number;
    errors?: Array<{
      chunk: string[];
      error: string;
    }>;
  };
}

export default function StorageCleanupPage() {
  const [loading, setLoading] = useState(true);
  const [orphans, setOrphans] = useState<OrphanFile[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    cron: "0 2 * * *",
    limit: 1000,
  });

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Deletion Progress State
  const [deletionProgress, setDeletionProgress] = useState<{
    status: "idle" | "deleting" | "success" | "error";
    total: number;
    current: number;
    errorMsg: string | null;
  }>({
    status: "idle",
    total: 0,
    current: 0,
    errorMsg: null,
  });

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"selected" | "all">("selected");

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/storage-cleanup", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch storage data");

      setOrphans(data.orphans || []);
      setSchedule(data.schedule || { enabled: false, cron: "0 2 * * *", limit: 1000 });
    } catch (e: any) {
      setError(e.message || "Failed to load storage assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orphans by search query
  const filteredOrphans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orphans;
    return orphans.filter((o) => o.name.toLowerCase().includes(q));
  }, [orphans, searchQuery]);

  // Paginated list
  const paginatedOrphans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrphans.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrphans, currentPage]);

  const totalPages = Math.ceil(filteredOrphans.length / itemsPerPage);

  const toggleSelectFile = (name: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    const allSelected = paginatedOrphans.every((o) => selectedFiles.has(o.name));
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      paginatedOrphans.forEach((o) => {
        if (allSelected) {
          next.delete(o.name);
        } else {
          next.add(o.name);
        }
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/storage-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_schedule",
          schedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update schedule");

      setSuccess("Scheduled clean-up settings updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e: any) {
      setError(e.message || "Failed to save schedule.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setShowDeleteModal(false);
    setError(null);
    setSuccess(null);

    const filesToDelete =
      deleteMode === "all"
        ? filteredOrphans.map((o) => o.name)
        : Array.from(selectedFiles);

    if (filesToDelete.length === 0) return;

    setIsDeleting(true);
    setDeletionProgress({
      status: "deleting",
      total: filesToDelete.length,
      current: 0,
      errorMsg: null,
    });

    const BATCH_SIZE = 40;
    const completedFiles: string[] = [];

    try {
      for (let i = 0; i < filesToDelete.length; i += BATCH_SIZE) {
        const batch = filesToDelete.slice(i, i + BATCH_SIZE);

        const res = await fetch("/api/admin/storage-cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete_orphans",
            files: batch,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to delete batch starting at item ${i + 1}`);
        }

        completedFiles.push(...batch);
        setDeletionProgress((prev) => ({
          ...prev,
          current: Math.min(prev.current + batch.length, prev.total),
        }));

        // Small cooling delay between API requests to prevent server spikes
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      setDeletionProgress((prev) => ({
        ...prev,
        status: "success",
      }));
      setSuccess(`Successfully deleted ${filesToDelete.length} unreferenced files from storage!`);

      // Update orphans list
      const deletedSet = new Set(filesToDelete);
      setOrphans((prev) => prev.filter((o) => !deletedSet.has(o.name)));
      setSelectedFiles(new Set());
      setCurrentPage(1);

      setTimeout(() => {
        setSuccess(null);
        setDeletionProgress((prev) => ({ ...prev, status: "idle" }));
      }, 4000);
    } catch (e: any) {
      const errMsg = e.message || "Failed to complete deletion process.";
      setDeletionProgress((prev) => ({
        ...prev,
        status: "error",
        errorMsg: errMsg,
      }));
      setError(errMsg);

      // Clean up whatever was successfully deleted before failure
      if (completedFiles.length > 0) {
        const deletedSet = new Set(completedFiles);
        setOrphans((prev) => prev.filter((o) => !deletedSet.has(o.name)));
        setSelectedFiles((prev) => {
          const next = new Set(prev);
          completedFiles.forEach((file) => next.delete(file));
          return next;
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerDeleteMode = (mode: "selected" | "all") => {
    setDeleteMode(mode);
    setShowDeleteModal(true);
  };

  const totalOrphanSizeMB = useMemo(() => {
    // Estimating average 220KB per file
    return Math.round((orphans.length * 220) / 102.4) / 10;
  }, [orphans]);

  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              Storage Clean-up Control Center
            </div>
            <div className="mt-1 text-[12px] text-black/45">
              Review and permanently clean up unreferenced images uploaded by vendors inside the <code>vendor-assets</code> storage bucket.
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start sm:self-center h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
            </svg>
            Scan Storage
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mx-6 mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 rounded-[3px] border border-[#16b364]/30 bg-[#f6fef9] px-4 py-3 text-[13px] text-[#027a48] font-medium">
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="p-6 grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-[3px] border border-black/5 bg-[#faf9f6] flex flex-col justify-between">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Total Orphan Images</span>
            <span className="mt-2 text-[32px] font-bold tracking-tight text-[#a67c52]">
              {loading ? "..." : orphans.length}
            </span>
            <span className="mt-1 text-[11px] text-black/45">Unreferenced in database</span>
          </div>

          <div className="p-4 rounded-[3px] border border-black/5 bg-[#faf9f6] flex flex-col justify-between">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Estimated Waste Space</span>
            <span className="mt-2 text-[32px] font-bold tracking-tight text-red-600">
              {loading ? "..." : `${totalOrphanSizeMB} MB`}
            </span>
            <span className="mt-1 text-[11px] text-black/45">Based on ~220KB avg per image</span>
          </div>

          <div className="p-4 rounded-[3px] border border-black/5 bg-[#faf9f6] flex flex-col justify-between">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Bucket Monitored</span>
            <span className="mt-2 text-[20px] font-bold text-[#2c2c2c]">
              vendor-assets
            </span>
            <span className="mt-1 text-[11px] text-black/45">Logos, galleries, promos folders</span>
          </div>
        </div>
      </div>

      {/* Scheduled Deletion Settings */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 bg-gray-50">
          <div className="text-[14px] font-bold text-[#2c2c2c]">Automated Daily Cleanup Scheduler</div>
          <div className="mt-0.5 text-[12px] text-black/45">
            Configure periodic background jobs to automatically swipe away orphan pictures.
          </div>
        </div>

        <form onSubmit={handleSaveSchedule} className="p-6 grid gap-6 md:grid-cols-4 items-end">
          <label className="grid gap-1.5 md:col-span-1">
            <span className="text-[12px] font-semibold text-black/55">Daily Schedule Toggle</span>
            <select
              value={schedule.enabled ? "true" : "false"}
              onChange={(e) => setSchedule((prev) => ({ ...prev, enabled: e.target.value === "true" }))}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled (Run Automatically)</option>
            </select>
          </label>

          <label className="grid gap-1.5 md:col-span-1">
            <span className="text-[12px] font-semibold text-black/55">Cron Schedule (UTC)</span>
            <input
              type="text"
              required
              value={schedule.cron}
              onChange={(e) => setSchedule((prev) => ({ ...prev, cron: e.target.value }))}
              placeholder="0 2 * * *"
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            />
          </label>

          <label className="grid gap-1.5 md:col-span-1">
            <span className="text-[12px] font-semibold text-black/55">Batch Processing Limit</span>
            <select
              value={schedule.limit}
              onChange={(e) => setSchedule((prev) => ({ ...prev, limit: Number(e.target.value) }))}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="100">100 files per batch</option>
              <option value="500">500 files per batch</option>
              <option value="1000">1,000 files per batch</option>
              <option value="5000">5,000 files per batch</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={isSavingSchedule}
            className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
          >
            {isSavingSchedule ? "Saving..." : "Save Configuration"}
          </button>
        </form>

        {/* Automated Cleanup Execution Metrics (last_run) */}
        {schedule.last_run ? (
          <div className="border-t border-black/5 bg-[#faf9f6] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[13px]">
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black/55">Last Automated Run:</span>
                <span className="font-mono text-[12px] bg-black/[0.03] px-2 py-0.5 rounded-[3px] text-black/70 font-semibold">
                  {new Date(schedule.last_run.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: true,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-black/55">Status:</span>
                {schedule.last_run.status === "success" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Completed with Issues
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-black/55">Files Cleaned:</span>
                <span className="font-bold text-black/80">
                  {schedule.last_run.deleted_count} files
                </span>
                {schedule.last_run.total_orphans_found > 0 && (
                  <span className="text-black/35 font-medium">
                    (out of {schedule.last_run.total_orphans_found} scanned)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-black/55">Space Reclaimed:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {Math.round((schedule.last_run.deleted_count * 220) / 102.4) / 10} MB
                </span>
              </div>
            </div>

            {schedule.last_run.errors && schedule.last_run.errors.length > 0 && (
              <div className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-100 rounded-[3px] px-3 py-2 max-w-md w-full">
                <div className="font-bold mb-0.5">Execution Warnings:</div>
                <div className="max-h-16 overflow-y-auto font-mono text-[10px] leading-tight space-y-1">
                  {schedule.last_run.errors.map((err, idx) => (
                    <div key={idx} className="truncate">
                      • {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-black/5 bg-[#faf9f6] px-6 py-4 text-[12px] text-black/45 italic font-medium flex items-center gap-2">
            <svg className="h-4.5 w-4.5 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No automated background executions recorded yet. The cron scheduler will trigger cleanup runs based on your saved configuration.
          </div>
        )}
      </div>

      {/* Manual Review and Preview Area */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="px-6 py-5 border-b border-black/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by filename or folder..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-9 pr-4 rounded-[3px] border border-black/10 bg-white text-[13px] outline-none focus:border-[#a67c52]/50"
              />
              <svg className="absolute left-3 top-3 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {selectedFiles.size > 0 && (
              <>
                <button
                  onClick={handleClearSelection}
                  className="h-10 px-3 rounded-[3px] border border-black/10 bg-white text-[13px] text-black/70 hover:bg-black/5 font-semibold transition-colors"
                >
                  Clear Selection ({selectedFiles.size})
                </button>
                <button
                  onClick={() => triggerDeleteMode("selected")}
                  className="h-10 px-4 rounded-[3px] bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedFiles.size})
                </button>
              </>
            )}

            {filteredOrphans.length > 0 && (
              <button
                onClick={() => triggerDeleteMode("all")}
                disabled={isDeleting}
                className="h-10 px-4 rounded-[3px] border border-red-200 text-red-600 bg-red-50 text-[13px] font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                Delete All Match ({filteredOrphans.length})
              </button>
            )}
          </div>
        </div>

        {/* Selected Counter & Multi-select on Page */}
        {filteredOrphans.length > 0 && !loading && (
          <div className="px-6 py-3 bg-[#faf9f6] border-b border-black/5 flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 font-semibold text-black/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paginatedOrphans.every((o) => selectedFiles.has(o.name))}
                onChange={handleSelectAllOnPage}
                className="h-4 w-4 rounded-[3px] border-black/25 text-[#a67c52] focus:ring-[#a67c52]/30 cursor-pointer"
              />
              Select All on Page
            </label>
            <span className="text-black/45">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrphans.length)}-{Math.min(currentPage * itemsPerPage, filteredOrphans.length)} of {filteredOrphans.length} unreferenced images
            </span>
          </div>
        )}

        {/* Image Grid Area */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a67c52]"></div>
              <span className="text-[13px] text-black/45 font-medium">Scanning storage bucket...</span>
            </div>
          ) : filteredOrphans.length === 0 ? (
            <div className="py-20 text-center text-black/45 text-[14px]">
              No unreferenced images found matching your search. Storage is clean!
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {paginatedOrphans.map((o) => {
                const isSelected = selectedFiles.has(o.name);
                return (
                  <div
                    key={o.name}
                    onClick={() => toggleSelectFile(o.name)}
                    className={`group relative rounded-[3px] border overflow-hidden aspect-square bg-[#faf9f6] hover:shadow-md transition-all cursor-pointer select-none flex flex-col ${
                      isSelected
                        ? "border-[#a67c52] ring-2 ring-[#a67c52]/20 shadow-sm"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full flex-1 overflow-hidden bg-black/[0.03] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.url}
                        alt={o.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Handle private or broken images elegantly
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(0,0,0,0.2)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
                        }}
                      />
                      
                      {/* Folder Label */}
                      <div className="absolute left-1.5 bottom-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] backdrop-blur-[2px] tracking-wide uppercase">
                        {o.name.split("/")[0]}
                      </div>
                    </div>

                    {/* Selection Checkbox Overlay */}
                    <div className="absolute right-2 top-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Controlled by outer container click
                        className="h-4 w-4 rounded-[3px] border-black/25 text-[#a67c52] focus:ring-[#a67c52]/30 cursor-pointer shadow-sm"
                      />
                    </div>

                    {/* Meta Footer */}
                    <div className="p-2 border-t border-black/5 bg-white text-[11px] leading-tight">
                      <div
                        className="font-medium text-black/70 truncate"
                        title={o.name.split("/").pop()}
                      >
                        {o.name.split("/").pop()}
                      </div>
                      <div className="mt-0.5 text-black/35 text-[9px] font-mono truncate" title={o.name}>
                        {o.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-black/5 flex items-center justify-between bg-gray-50/50">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-[12px] text-black/50">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Warning Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in">
          <div className="w-full max-w-md bg-white border border-black/10 rounded-[3px] shadow-xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-black/5 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[16px] font-bold">WARNING: Permanent Deletion</span>
              </div>
            </div>

            <div className="p-6 grid gap-4">
              <p className="text-[13px] text-black/60 leading-relaxed">
                You are about to permanently delete{" "}
                <strong className="text-red-600 text-[14px]">
                  {deleteMode === "all" ? filteredOrphans.length : selectedFiles.size}
                </strong>{" "}
                unreferenced image files from your <strong>Supabase S3 bucket</strong> storage.
              </p>
              <div className="p-3 bg-red-50/50 rounded-[3px] border border-red-100 text-[12px] text-red-800">
                <strong>CRITICAL NOTICE:</strong> This action is completely irreversible. The actual image binaries will be wiped out from the storage drive, and any cached copies will be purged.
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-black/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="h-10 px-4 rounded-[3px] bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors flex items-center gap-1.5"
              >
                Confirm & Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Progress Modal Overlay */}
      {deletionProgress.status !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in">
          <div className="w-full max-w-md bg-white border border-black/10 rounded-[3px] shadow-xl overflow-hidden animate-scale-up">
            {/* Header */}
            <div className={`px-6 py-5 border-b border-black/5 flex items-center gap-3 ${
              deletionProgress.status === "error" ? "bg-red-50 text-red-700" : 
              deletionProgress.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-[#faf9f6] text-[#a67c52]"
            }`}>
              {deletionProgress.status === "deleting" && (
                <svg className="animate-spin h-5 w-5 text-[#a67c52]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {deletionProgress.status === "success" && (
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {deletionProgress.status === "error" && (
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span className="text-[15px] font-bold">
                {deletionProgress.status === "deleting" && "Deleting Unreferenced Images..."}
                {deletionProgress.status === "success" && "Wiping Action Completed!"}
                {deletionProgress.status === "error" && "Deletion Interrupted"}
              </span>
            </div>

            {/* Progress Body */}
            <div className="p-6 grid gap-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-black/60">
                  {deletionProgress.status === "deleting" && "Physically cleaning storage bucket..."}
                  {deletionProgress.status === "success" && "Files cleared successfully."}
                  {deletionProgress.status === "error" && "An error occurred during bulk cleanup."}
                </span>
                <span className="font-bold text-[#a67c52] font-mono text-[14px]">
                  {deletionProgress.total > 0 ? Math.round((deletionProgress.current / deletionProgress.total) * 100) : 0}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    deletionProgress.status === "error" ? "bg-red-500" :
                    deletionProgress.status === "success" ? "bg-emerald-500" : "bg-[#a67c52]"
                  }`}
                  style={{ width: `${deletionProgress.total > 0 ? (deletionProgress.current / deletionProgress.total) * 100 : 0}%` }}
                />
              </div>

              <div className="text-[12px] text-black/45 flex justify-between font-medium">
                <span>Progress: {deletionProgress.current} / {deletionProgress.total} files</span>
                {deletionProgress.status === "deleting" && (
                  <span className="animate-pulse">Processing in batches...</span>
                )}
              </div>

              {/* Error Details */}
              {deletionProgress.status === "error" && deletionProgress.errorMsg && (
                <div className="p-3 bg-red-50 rounded-[3px] border border-red-100 text-[12px] text-red-800 leading-relaxed font-medium">
                  <div className="font-bold mb-1">Details:</div>
                  {deletionProgress.errorMsg}
                  <div className="mt-2 text-[10px] text-red-600/80">
                    * Successfully cleared chunks before the failure have been updated. You can safely retry the remaining selected items.
                  </div>
                </div>
              )}

              {/* Success Details */}
              {deletionProgress.status === "success" && (
                <div className="p-3 bg-emerald-50/50 rounded-[3px] border border-emerald-100 text-[12px] text-emerald-800 font-medium">
                  All {deletionProgress.total} selected items have been completely removed from storage servers and database listings.
                </div>
              )}
            </div>

            {/* Footer */}
            {deletionProgress.status !== "deleting" && (
              <div className="px-6 py-4 bg-gray-50 border-t border-black/5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setDeletionProgress((prev) => ({ ...prev, status: "idle" }))}
                  className={`h-9 px-4 rounded-[3px] text-[12px] font-semibold transition-colors ${
                    deletionProgress.status === "error"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-black/80 hover:bg-black/90 text-white"
                  }`}
                >
                  Dismiss Overlay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
