import React from "react";

export function ProfileSection({
  editForm,
  setEditForm,
  regions,
  cities
}: {
  editForm: any;
  setEditForm: (v: any) => void;
  regions?: {id: number, name: string}[];
  cities?: {id: number, name: string, province_id: number}[];
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
        Profile Information
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Business Name</span>
          <input
            value={editForm.business_name}
            onChange={(e) => setEditForm((f: any) => ({ ...f, business_name: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Slug</span>
          <input
            value={editForm.slug}
            onChange={(e) => setEditForm((f: any) => ({ ...f, slug: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[12px] font-semibold text-black/55">Why Trust Us</span>
        <div className="relative">
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm((f: any) => ({ ...f, description: e.target.value.slice(0, 300) }))}
            rows={3}
            maxLength={300}
            className="rounded-[3px] border border-black/10 px-3 py-2 text-[13px] pr-14 break-words w-full"
          />
          <span className="absolute bottom-2 right-3 text-[11px] text-black/40">{(editForm.description?.length ?? 0)}/300</span>
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Region</span>
          {regions && regions.length > 0 ? (
            <select
              value={editForm.province_id || ""}
              onChange={(e) => setEditForm((f: any) => ({ ...f, province_id: e.target.value ? Number(e.target.value) : null, city_id: null, city: "" }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px] bg-white outline-none"
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          ) : (
            <input
              value={editForm.province_id || ""}
              onChange={(e) => setEditForm((f: any) => ({ ...f, province_id: e.target.value ? Number(e.target.value) : null }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
              placeholder="Province ID"
              type="number"
            />
          )}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">City</span>
          {cities && regions && regions.length > 0 ? (
            <select
              value={editForm.city_id || ""}
              onChange={(e) => {
                const selectedCity = cities.find(c => c.id === Number(e.target.value));
                setEditForm((f: any) => ({ ...f, city_id: selectedCity ? selectedCity.id : null, city: selectedCity ? selectedCity.name : "" }))
              }}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px] bg-white outline-none"
              disabled={!editForm.province_id}
            >
              <option value="">Select City</option>
              {(() => {
                if (!editForm.province_id) return null;
                return cities.filter(c => c.province_id === editForm.province_id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ));
              })()}
            </select>
          ) : (
            <input
              value={editForm.city}
              onChange={(e) => setEditForm((f: any) => ({ ...f, city: e.target.value }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            />
          )}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Year Established <span className="text-red-500">*</span></span>
          <input
            type="text"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="YYYY (e.g. 2015)"
            value={editForm.year_established || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
              setEditForm((f: any) => ({ ...f, year_established: val }));
            }}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            required
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-3">
          <span className="text-[12px] font-semibold text-black/55">Address</span>
          <input
            value={editForm.address}
            onChange={(e) => setEditForm((f: any) => ({ ...f, address: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
      </div>
    </section>
  );
}
