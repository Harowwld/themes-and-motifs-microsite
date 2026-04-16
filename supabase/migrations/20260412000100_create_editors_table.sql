-- Migration to create editors table
-- Allows editors to modify vendor photos and entries

create table public.editors (
  id uuid primary key default gen_random_uuid(),
  vendor_id bigint,
  user_id uuid references auth.users(id) not null,
  can_edit_photos boolean default true,
  can_edit_entries boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable row level security if needed
alter table public.editors enable row level security;

-- Example policy allowing the assigned user to manage their editor record
create policy "allow editor owner" on public.editors
  for all using (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_editors_user_id ON public.editors(user_id);
CREATE INDEX idx_editors_vendor_id ON public.editors(vendor_id);
