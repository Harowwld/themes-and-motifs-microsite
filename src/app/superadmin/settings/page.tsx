"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";


import { SuperadminInvite } from "./components/SuperadminInvite";

type Row = Record<string, any> & { id: number };

type TableName = "plans" | "categories" | "regions" | "affiliations";

type FieldType = "text" | "number" | "json";

type TableField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  width: string;
};

const TABLE_FIELDS: Record<TableName, TableField[]> = {
  plans: [
    { key: "name", label: "Name", type: "text", required: true, width: "220px" },
    { key: "price", label: "Price", type: "number", width: "140px" },
    { key: "description", label: "Description", type: "text", width: "1fr" },
    { key: "features", label: "Features (JSON)", type: "json", width: "1fr" },
  ],
  categories: [
    { key: "name", label: "Name", type: "text", required: true, width: "220px" },
    { key: "slug", label: "Slug", type: "text", required: true, width: "220px" },
    { key: "icon", label: "Icon", type: "text", width: "200px" },
    { key: "display_order", label: "Order", type: "number", width: "140px" },
    { key: "description", label: "Description", type: "text", width: "1fr" },
  ],
  regions: [
    { key: "name", label: "Name", type: "text", required: true, width: "260px" },
    { key: "parent_id", label: "Parent ID", type: "number", width: "180px" },
  ],
  affiliations: [
    { key: "name", label: "Name", type: "text", required: true, width: "260px" },
    { key: "slug", label: "Slug", type: "text", required: true, width: "260px" },
  ],
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}

export default function SuperadminSettingsPage() {
  const [table, setTable] = useState<TableName>("plans");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPrice, setCreatePrice] = useState<string>("");
  const [createFeatures, setCreateFeatures] = useState<string>("");
  const [createIcon, setCreateIcon] = useState<string>("");
  const [createDisplayOrder, setCreateDisplayOrder] = useState<string>("");
  const [createParentId, setCreateParentId] = useState<string>("");
  const [createSaving, setCreateSaving] = useState(false);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [globalAdsEnabled, setGlobalAdsEnabled] = useState(true);
  const [updatingAds, setUpdatingAds] = useState(false);

  async function loadSystemSettings() {
    try {
      const data = await apiFetch<{ settings: any[] }>("/api/admin/system-settings");
      const adsSetting = data.settings?.find((s) => s.key === "global_ads_enabled");
      if (adsSetting) {
        const val = adsSetting.value;
        if (typeof val === "boolean") {
          setGlobalAdsEnabled(val);
        } else if (val && typeof val === "object" && typeof val.enabled === "boolean") {
          setGlobalAdsEnabled(val.enabled);
        } else {
          setGlobalAdsEnabled(true);
        }
      }
    } catch (e) {
      console.error("Failed to load system settings:", e);
    }
  }

  async function toggleGlobalAds() {
    setUpdatingAds(true);
    const nextVal = !globalAdsEnabled;
    try {
      await apiFetch("/api/admin/system-settings", {
        method: "PATCH",
        body: JSON.stringify({ key: "global_ads_enabled", value: { enabled: nextVal } }),
      });
      setGlobalAdsEnabled(nextVal);
      toast.success(nextVal ? "Global Sponsored Ads Banners enabled." : "Global Sponsored Ads Banners disabled.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update global ads setting.");
    } finally {
      setUpdatingAds(false);
    }
  }

  async function refresh(nextTable?: TableName) {
    const t = nextTable ?? table;
    setLoading(true);
    try {
      const res = await apiFetch<{ rows: Row[] }>(`/api/admin/settings?table=${encodeURIComponent(t)}`);
      setRows(res.rows ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (!pwCurrent || !pwNew) {
      toast.error("Current and new password are required.");
      return;
    }
    if (pwNew.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await apiFetch<{ ok: boolean }>("/api/admin/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      toast.success("Password changed successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  useEffect(() => {
    refresh();
    loadSystemSettings();
  }, []);

  useEffect(() => {
    refresh(table);
  }, [table]);

  useEffect(() => {
    setCreateName("");
    setCreateSlug("");
    setCreateDescription("");
    setCreatePrice("");
    setCreateFeatures("");
    setCreateIcon("");
    setCreateDisplayOrder("");
    setCreateParentId("");
  }, [table]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  async function patchRow(id: number, patch: Record<string, any>) {
    if (!patch || Object.keys(patch).length === 0) return;

    setSavingId(id);
    try {
      const res = await apiFetch<{ row: Row }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ table, id, patch }),
      });
      setRows((prev) => prev.map((r) => (r.id === id ? (res.row as any) : r)));
      toast.success("Row updated successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update row.");
    } finally {
      setSavingId(null);
    }
  }

  async function createRow() {
    const data: Record<string, any> = {};
    for (const f of TABLE_FIELDS[table]) {
      if (f.key === "name") data.name = createName;
      if (f.key === "slug") data.slug = createSlug;
      if (f.key === "description") data.description = createDescription;
      if (f.key === "price") data.price = createPrice;
      if (f.key === "features") data.features = createFeatures;
      if (f.key === "icon") data.icon = createIcon;
      if (f.key === "display_order") data.display_order = createDisplayOrder;
      if (f.key === "parent_id") data.parent_id = createParentId;
    }

    for (const f of TABLE_FIELDS[table]) {
      if (!f.required) continue;
      const raw = String((data as any)[f.key] ?? "").trim();
      if (!raw) {
        toast.error(`${f.label} is required.`);
        return;
      }
    }

    const payload: Record<string, any> = {};
    for (const f of TABLE_FIELDS[table]) {
      const raw = (data as any)[f.key];
      if (raw == null) continue;

      if (f.type === "text") {
        const v = String(raw).trim();
        if (v) payload[f.key] = v;
      }
      if (f.type === "number") {
        const s = String(raw).trim();
        if (!s) continue;
        const n = Number(s);
        if (!Number.isFinite(n)) {
          toast.error(`${f.label} must be a number.`);
          return;
        }
        payload[f.key] = n;
      }
      if (f.type === "json") {
        const s = String(raw).trim();
        if (!s) continue;
        try {
          payload[f.key] = JSON.parse(s);
        } catch {
          toast.error(`${f.label} must be valid JSON.`);
          return;
        }
      }
    }

    setCreateSaving(true);
    try {
      const res = await apiFetch<{ row: Row }>("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ table, data: payload }),
      });
      setRows((prev) => [res.row, ...prev]);
      setCreateName("");
      setCreateSlug("");
      setCreateDescription("");
      setCreatePrice("");
      setCreateFeatures("");
      setCreateIcon("");
      setCreateDisplayOrder("");
      setCreateParentId("");
      toast.success("Row created successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create row.");
    } finally {
      setCreateSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Settings</div>
          <div className="mt-1 text-[12px] text-black/45">Manage reference data.</div>
        </div>

        <div className="p-6 grid gap-4">
          <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-black/5">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Change password</div>
              <div className="mt-1 text-[12px] text-black/45">Updates the current superadmin password and logs out other sessions.</div>
            </div>
            <div className="p-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Current password</span>
                  <input
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">New password</span>
                  <input
                    type="password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Confirm</span>
                  <input
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={pwSaving}
                  onClick={changePassword}
                  className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {pwSaving ? "Saving…" : "Change password"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#2c2c2c]">Global sponsored ads control</div>
                <div className="mt-1 text-[12px] text-black/45">Toggle whether the premium auto-rotating sponsored ads banners are displayed on couple dashboards and public microsites.</div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-[#fffcf5]/50">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${globalAdsEnabled ? "bg-green-500 animate-pulse" : "bg-neutral-300"}`} />
                <span className="text-[13px] font-medium text-neutral-700">
                  Global Sponsored Ads Banner is {globalAdsEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <button
                type="button"
                disabled={updatingAds}
                onClick={toggleGlobalAds}
                className={`h-9 px-4 rounded-[3px] font-semibold text-[12px] uppercase tracking-wider transition-all cursor-pointer ${
                  globalAdsEnabled
                    ? "bg-[#b42318] hover:bg-[#9a1d14] text-white"
                    : "bg-[#027a48] hover:bg-[#026039] text-white"
                } disabled:opacity-60`}
              >
                {updatingAds ? "Updating..." : globalAdsEnabled ? "Disable Ads Globally" : "Enable Ads Globally"}
              </button>
            </div>
          </section>

          <SuperadminInvite />

          <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Table</span>
              <select
                value={table}
                onChange={(e) => setTable(e.target.value as TableName)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              >
                <option value="plans">plans</option>
                <option value="categories">categories</option>
                <option value="regions">regions</option>
                <option value="affiliations">affiliations</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search"
              />
            </label>

            <button
              type="button"
              onClick={() => refresh(table)}
              className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Refresh
            </button>
          </div>

          <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-black/5">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Add new</div>
              <div className="mt-1 text-[12px] text-black/45">Create a new row in the selected table.</div>
            </div>
            <div className="p-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {TABLE_FIELDS[table].map((f) => {
                  const common =
                    "h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15";

                  if (f.key === "name") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createName} onChange={(e) => setCreateName(e.target.value)} className={common} />
                      </label>
                    );
                  }
                  if (f.key === "slug") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} className={common} />
                      </label>
                    );
                  }
                  if (f.key === "description") {
                    return (
                      <label key={f.key} className="grid gap-1.5 sm:col-span-2">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} className={common} />
                      </label>
                    );
                  }
                  if (f.key === "price") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createPrice} onChange={(e) => setCreatePrice(e.target.value)} className={common} placeholder="0" />
                      </label>
                    );
                  }
                  if (f.key === "features") {
                    return (
                      <label key={f.key} className="grid gap-1.5 sm:col-span-2">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <textarea
                          value={createFeatures}
                          onChange={(e) => setCreateFeatures(e.target.value)}
                          className="min-h-24 rounded-[3px] border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                          placeholder='{"feature": true}'
                        />
                      </label>
                    );
                  }
                  if (f.key === "icon") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createIcon} onChange={(e) => setCreateIcon(e.target.value)} className={common} />
                      </label>
                    );
                  }
                  if (f.key === "display_order") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createDisplayOrder} onChange={(e) => setCreateDisplayOrder(e.target.value)} className={common} placeholder="0" />
                      </label>
                    );
                  }
                  if (f.key === "parent_id") {
                    return (
                      <label key={f.key} className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-black/55">{f.label}</span>
                        <input value={createParentId} onChange={(e) => setCreateParentId(e.target.value)} className={common} placeholder="(optional)" />
                      </label>
                    );
                  }

                  return null;
                })}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={createSaving}
                  onClick={createRow}
                  className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {createSaving ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </section>

          <div className="rounded-[3px] border border-black/10 overflow-hidden">
            <div
              className="grid gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5"
              style={{
                gridTemplateColumns: ["90px", ...TABLE_FIELDS[table].map((f) => f.width), "140px"].join(" "),
              }}
            >
              <div className="px-3 py-2">ID</div>
              {TABLE_FIELDS[table].map((f) => (
                <div key={f.key} className="px-3 py-2">
                  {f.label}
                </div>
              ))}
              <div className="px-3 py-2">Actions</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No rows found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((r) => (
                  <SettingsRow
                    key={`${table}-${r.id}`}
                    row={r}
                    table={table}
                    saving={savingId === r.id}
                    onSave={(patch) => patchRow(r.id, patch)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({
  row,
  table,
  saving,
  onSave,
}: {
  row: Row;
  table: TableName;
  saving: boolean;
  onSave: (patch: Record<string, any>) => void;
}) {
  const fields = TABLE_FIELDS[table];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (row as any)[f.key];
      if (f.type === "json") {
        next[f.key] = v == null ? "" : JSON.stringify(v);
      } else {
        next[f.key] = v == null ? "" : String(v);
      }
    }
    return next;
  });

  const inputClass =
    "h-9 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15";

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: ["90px", ...fields.map((f) => f.width), "140px"].join(" "),
      }}
    >
      <div className="px-3 py-3 text-[13px] text-black/60">{row.id}</div>
      {fields.map((f) => {
        if (f.type === "json") {
          return (
            <div key={f.key} className="px-3 py-3">
              <textarea
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="min-h-18 w-full rounded-[3px] border border-black/10 bg-white px-2 py-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              />
            </div>
          );
        }

        return (
          <div key={f.key} className="px-3 py-3">
            <input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className={inputClass}
            />
          </div>
        );
      })}

      <div className="px-3 py-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const patch: Record<string, any> = {};

            for (const f of fields) {
              const raw = String(values[f.key] ?? "");

              if (f.required && !raw.trim()) {
                toast.error(`${f.label} is required.`);
                return;
              }

              if (f.type === "text") {
                const v = raw.trim();
                patch[f.key] = v ? v : null;
              }

              if (f.type === "number") {
                const s = raw.trim();
                if (!s) continue;
                const n = Number(s);
                if (!Number.isFinite(n)) {
                  toast.error(`${f.label} must be a number.`);
                  return;
                }
                patch[f.key] = n;
              }

              if (f.type === "json") {
                const s = raw.trim();
                if (!s) {
                  patch[f.key] = null;
                  continue;
                }
                try {
                  patch[f.key] = JSON.parse(s);
                } catch {
                  toast.error(`${f.label} must be valid JSON.`);
                  return;
                }
              }
            }

            onSave(patch);
          }}
          className="h-9 w-full rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}
