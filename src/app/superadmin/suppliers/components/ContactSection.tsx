import React from "react";

export function ContactSection({
  editForm,
  setEditForm
}: {
  editForm: any;
  setEditForm: (v: any) => void;
}) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
          Contact Info (Public)
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Email</span>
            <input
              type="email"
              value={editForm.contact_email}
              onChange={(e) => setEditForm((f: any) => ({ ...f, contact_email: e.target.value }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Phone</span>
            <input
              value={editForm.contact_phone}
              onChange={(e) => setEditForm((f: any) => ({ ...f, contact_phone: e.target.value }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Website URL</span>
            <input
              type="url"
              value={editForm.website_url}
              onChange={(e) => setEditForm((f: any) => ({ ...f, website_url: e.target.value }))}
              className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
          Admin Contact (internal)
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Person 1 Name</span>
            <input value={editForm.contact_person_1_name} onChange={(e) => setEditForm((f: any) => ({ ...f, contact_person_1_name: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Person 1 Position</span>
            <input value={editForm.contact_person_1_position} onChange={(e) => setEditForm((f: any) => ({ ...f, contact_person_1_position: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Person 2 Name</span>
            <input value={editForm.contact_person_2_name} onChange={(e) => setEditForm((f: any) => ({ ...f, contact_person_2_name: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Contact Person 2 Position</span>
            <input value={editForm.contact_person_2_position} onChange={(e) => setEditForm((f: any) => ({ ...f, contact_person_2_position: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Email 1</span>
            <input type="email" value={editForm.admin_email_1} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_email_1: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Email 2</span>
            <input type="email" value={editForm.admin_email_2} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_email_2: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Email 3</span>
            <input type="email" value={editForm.admin_email_3} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_email_3: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Phone 1</span>
            <input value={editForm.admin_phone_1} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_phone_1: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Phone 2</span>
            <input value={editForm.admin_phone_2} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_phone_2: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Admin Phone 3</span>
            <input value={editForm.admin_phone_3} onChange={(e) => setEditForm((f: any) => ({ ...f, admin_phone_3: e.target.value }))} className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]" />
          </label>
        </div>
      </section>
    </div>
  );
}
