import React from "react";

export function ProfileSection({
  editForm,
  setEditForm
}: {
  editForm: any;
  setEditForm: (v: any) => void;
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
        <span className="text-[12px] font-semibold text-black/55">What Makes Us Unique</span>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Region</span>
          <input
            value={editForm.location_text}
            onChange={(e) => setEditForm((f: any) => ({ ...f, location_text: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            placeholder="e.g., Makati, Metro Manila"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">City</span>
          <input
            value={editForm.city}
            onChange={(e) => setEditForm((f: any) => ({ ...f, city: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
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
