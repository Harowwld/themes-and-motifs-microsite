"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface Region {
  id: number;
  name: string;
  created_at: string;
}

interface City {
  id: number;
  name: string;
  province_id: number;
  created_at: string;
}

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

export default function SuperadminLocationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [activeTab, setActiveTab] = useState<"regions" | "cities">("regions");
  const [search, setSearch] = useState("");

  const [deletingRegionId, setDeletingRegionId] = useState<number | null>(null);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);

  const [deletingCityId, setDeletingCityId] = useState<number | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);

  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [newRegionName, setNewRegionName] = useState("");
  const [savingRegion, setSavingRegion] = useState(false);

  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [newCityName, setNewCityName] = useState("");
  const [newCityRegionId, setNewCityRegionId] = useState("");
  const [savingCity, setSavingCity] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [regionsRes, citiesRes] = await Promise.all([
        apiFetch<{ regions: Region[] }>("/api/admin/regions"),
        apiFetch<{ cities: City[] }>("/api/admin/cities"),
      ]);
      setRegions(regionsRes.regions ?? []);
      setCities(citiesRes.cities ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load locations data.");
    } finally {
      setLoading(false);
    }
  }

  // --- REGIONS LOGIC ---

  async function deleteRegion(id: number) {
    setDeletingRegionId(id);
    try {
      await apiFetch<{ success: boolean; message: string }>(`/api/admin/regions?id=${id}`, {
        method: "DELETE",
      });
      setRegions((prev) => prev.filter((r) => r.id !== id));
      setRegionToDelete(null);
      toast.success("Region deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete region.");
    } finally {
      setDeletingRegionId(null);
    }
  }

  function handleEditRegion(region: Region) {
    setEditingRegion(region);
    setNewRegionName(region.name);
    setShowRegionForm(true);
  }

  function resetRegionForm() {
    setShowRegionForm(false);
    setEditingRegion(null);
    setNewRegionName("");
  }

  async function saveRegion(e: React.FormEvent) {
    e.preventDefault();
    if (!newRegionName.trim()) {
      toast.error("Region name is required.");
      return;
    }
    setSavingRegion(true);
    try {
      if (editingRegion) {
        const res = await apiFetch<{ success: boolean; region: Region }>("/api/admin/regions", {
          method: "PUT",
          body: JSON.stringify({
            id: editingRegion.id,
            name: newRegionName,
          }),
        });
        toast.success("Region updated successfully.");
        setRegions((prev) => prev.map((r) => (r.id === res.region.id ? res.region : r)));
      } else {
        const res = await apiFetch<{ success: boolean; region: Region }>("/api/admin/regions", {
          method: "POST",
          body: JSON.stringify({
            name: newRegionName,
          }),
        });
        toast.success("Region added successfully.");
        setRegions((prev) => [...prev, res.region].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetRegionForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save region.");
    } finally {
      setSavingRegion(false);
    }
  }

  const filteredRegions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((r) => r.name.toLowerCase().includes(q));
  }, [regions, search]);


  // --- CITIES LOGIC ---

  async function deleteCity(id: number) {
    setDeletingCityId(id);
    try {
      await apiFetch<{ success: boolean; message: string }>(`/api/admin/cities?id=${id}`, {
        method: "DELETE",
      });
      setCities((prev) => prev.filter((c) => c.id !== id));
      setCityToDelete(null);
      toast.success("City / Wedding Center deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete city.");
    } finally {
      setDeletingCityId(null);
    }
  }

  function handleEditCity(city: City) {
    setEditingCity(city);
    setNewCityName(city.name);
    setNewCityRegionId(city.province_id.toString());
    setShowCityForm(true);
  }

  function resetCityForm() {
    setShowCityForm(false);
    setEditingCity(null);
    setNewCityName("");
    setNewCityRegionId("");
  }

  async function saveCity(e: React.FormEvent) {
    e.preventDefault();
    if (!newCityName.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!newCityRegionId) {
      toast.error("Please select a Region.");
      return;
    }
    setSavingCity(true);
    try {
      if (editingCity) {
        const res = await apiFetch<{ success: boolean; city: City }>("/api/admin/cities", {
          method: "PUT",
          body: JSON.stringify({
            id: editingCity.id,
            name: newCityName,
            province_id: newCityRegionId,
          }),
        });
        toast.success("Updated successfully.");
        setCities((prev) => prev.map((c) => (c.id === res.city.id ? res.city : c)));
      } else {
        const res = await apiFetch<{ success: boolean; city: City }>("/api/admin/cities", {
          method: "POST",
          body: JSON.stringify({
            name: newCityName,
            province_id: newCityRegionId,
          }),
        });
        toast.success("Added successfully.");
        setCities((prev) => [...prev, res.city].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetCityForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save city.");
    } finally {
      setSavingCity(false);
    }
  }

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    let res = cities;
    if (q) {
      res = cities.filter((c) => c.name.toLowerCase().includes(q));
    }
    // group by region
    const grouped = res.reduce((acc, city) => {
      if (!acc[city.province_id]) acc[city.province_id] = [];
      acc[city.province_id].push(city);
      return acc;
    }, {} as Record<number, City[]>);
    return grouped;
  }, [cities, search]);


  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#2c2c2c]">Locations Management</h1>
            <p className="text-[13px] text-black/50 mt-1">
              Manage regions and cities/wedding centers.
            </p>
          </div>
          <button
            onClick={() => router.push("/superadmin")}
            className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-medium text-black/70 hover:bg-black/[0.02] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-black/10 mb-6">
          <button
            onClick={() => setActiveTab("regions")}
            className={`pb-2 px-1 text-[14px] font-semibold transition-colors border-b-2 ${
              activeTab === "regions"
                ? "border-[#a67c52] text-[#a67c52]"
                : "border-transparent text-black/50 hover:text-black/80"
            }`}
          >
            Regions ({regions.length})
          </button>
          <button
            onClick={() => setActiveTab("cities")}
            className={`pb-2 px-1 text-[14px] font-semibold transition-colors border-b-2 ${
              activeTab === "cities"
                ? "border-[#a67c52] text-[#a67c52]"
                : "border-transparent text-black/50 hover:text-black/80"
            }`}
          >
            Cities / Wedding Centers ({cities.length})
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === "regions" ? "regions" : "cities"}...`}
            className="h-10 w-full max-w-md rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
          />
          <button
            onClick={() => {
              if (activeTab === "regions") {
                showRegionForm ? resetRegionForm() : setShowRegionForm(true);
              } else {
                showCityForm ? resetCityForm() : setShowCityForm(true);
              }
            }}
            className="h-9 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6943] text-white text-[13px] font-medium transition-colors whitespace-nowrap"
          >
            {activeTab === "regions"
              ? (showRegionForm ? "Cancel" : "+ Add Region")
              : (showCityForm ? "Cancel" : "+ Add City / Center")}
          </button>
        </div>

        {/* REGIONS TAB */}
        {activeTab === "regions" && (
          <>
            {showRegionForm && (
              <form onSubmit={saveRegion} className="mb-6 p-5 rounded-[3px] border border-black/10 bg-white shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c] mb-4">
                  {editingRegion ? "Edit Region" : "Create New Region"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRegionName}
                      onChange={(e) => setNewRegionName(e.target.value)}
                      placeholder="e.g. Metro Manila, International"
                      className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetRegionForm}
                    className="h-8 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-medium text-black/70 hover:bg-black/[0.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRegion}
                    className="h-8 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6943] text-white text-[12px] font-medium transition-colors disabled:opacity-60"
                  >
                    {savingRegion ? "Saving..." : "Save Region"}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-[3px] border border-black/10 bg-white animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredRegions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between rounded-[3px] border border-black/10 bg-white px-4 py-3 hover:bg-black/[0.01]"
                  >
                    <div className="text-[14px] font-semibold text-[#2c2c2c]">{region.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRegion(region)}
                        className="h-8 px-3 rounded-[3px] border border-black/10 text-[12px] font-medium text-black/70 hover:bg-black/[0.05] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setRegionToDelete(region)}
                        disabled={deletingRegionId === region.id}
                        className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 text-[12px] font-medium text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                      >
                        {deletingRegionId === region.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredRegions.length === 0 && (
                  <div className="text-[13px] text-black/50 italic p-4 text-center border border-black/10 rounded-[3px] bg-white">
                    No regions found.
                  </div>
                )}
              </div>
            )}
          </>
        )}


        {/* CITIES TAB */}
        {activeTab === "cities" && (
          <>
            {showCityForm && (
              <form onSubmit={saveCity} className="mb-6 p-5 rounded-[3px] border border-black/10 bg-white shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c] mb-4">
                  {editingCity ? "Edit City / Wedding Center" : "Create New City / Wedding Center"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                      Region *
                    </label>
                    <select
                      required
                      value={newCityRegionId}
                      onChange={(e) => setNewCityRegionId(e.target.value)}
                      className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                      City / Wedding Center Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      placeholder="e.g. Quezon City, SM Megamall"
                      className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetCityForm}
                    className="h-8 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-medium text-black/70 hover:bg-black/[0.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCity}
                    className="h-8 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6943] text-white text-[12px] font-medium transition-colors disabled:opacity-60"
                  >
                    {savingCity ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-[3px] border border-black/10 bg-white animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {regions.filter(r => filteredCities[r.id] && filteredCities[r.id].length > 0).map((region) => (
                  <div key={region.id} className="rounded-[3px] border border-black/10 bg-white overflow-hidden shadow-sm">
                    <div className="bg-[#f0f0f0] px-4 py-2 border-b border-black/10 text-[13px] font-bold text-[#2c2c2c]">
                      {region.name}
                    </div>
                    <div className="divide-y divide-black/5">
                      {filteredCities[region.id].map((city) => (
                        <div key={city.id} className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.01]">
                          <div className="text-[14px] font-semibold text-[#2c2c2c] pl-2">{city.name}</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCity(city)}
                              className="h-8 px-3 rounded-[3px] border border-black/10 text-[12px] font-medium text-black/70 hover:bg-black/[0.05] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setCityToDelete(city)}
                              disabled={deletingCityId === city.id}
                              className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 text-[12px] font-medium text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                            >
                              {deletingCityId === city.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(filteredCities).length === 0 && (
                  <div className="text-[13px] text-black/50 italic p-4 text-center border border-black/10 rounded-[3px] bg-white">
                    No cities/wedding centers found matching your search.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal for Regions */}
      {regionToDelete && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRegionToDelete(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Region</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this region? You can only do this if it has no cities.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{regionToDelete.name}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingRegionId}
                  onClick={() => setRegionToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingRegionId}
                  onClick={() => deleteRegion(regionToDelete.id)}
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingRegionId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Cities */}
      {cityToDelete && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCityToDelete(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete City / Wedding Center</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this location? 
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{cityToDelete.name}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingCityId}
                  onClick={() => setCityToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingCityId}
                  onClick={() => deleteCity(cityToDelete.id)}
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingCityId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
