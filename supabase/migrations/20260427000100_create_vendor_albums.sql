create sequence if not exists "public"."vendor_albums_id_seq";

create sequence if not exists "public"."vendor_album_photos_id_seq";

create table if not exists "public"."vendor_albums" (
  "id" integer not null default nextval('public.vendor_albums_id_seq'::regclass),
  "vendor_id" integer not null,
  "title" character varying(255) not null,
  "slug" character varying(255) not null,
  "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint "vendor_albums_pkey" primary key ("id"),
  constraint "vendor_albums_vendor_id_fkey" foreign key ("vendor_id") references "public"."vendors"("id") on delete cascade
);

create unique index if not exists "vendor_albums_vendor_id_slug_key" on "public"."vendor_albums" using btree ("vendor_id", "slug");
create index if not exists "idx_vendor_albums_vendor" on "public"."vendor_albums" using btree ("vendor_id");

alter table "public"."vendor_albums" enable row level security;

create table if not exists "public"."vendor_album_photos" (
  "id" integer not null default nextval('public.vendor_album_photos_id_seq'::regclass),
  "vendor_id" integer not null,
  "album_id" integer not null,
  "image_url" text not null,
  "display_order" integer default 0,
  "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint "vendor_album_photos_pkey" primary key ("id"),
  constraint "vendor_album_photos_vendor_id_fkey" foreign key ("vendor_id") references "public"."vendors"("id") on delete cascade,
  constraint "vendor_album_photos_album_id_fkey" foreign key ("album_id") references "public"."vendor_albums"("id") on delete cascade
);

create unique index if not exists "vendor_album_photos_album_id_image_url_key" on "public"."vendor_album_photos" using btree ("album_id", "image_url");
create index if not exists "idx_vendor_album_photos_album" on "public"."vendor_album_photos" using btree ("album_id");
create index if not exists "idx_vendor_album_photos_vendor_album" on "public"."vendor_album_photos" using btree ("vendor_id", "album_id");

alter table "public"."vendor_album_photos" enable row level security;

-- Public read
create policy "Public can view vendor albums"
on "public"."vendor_albums"
for select
to public
using (true);

create policy "Public can view vendor album photos"
on "public"."vendor_album_photos"
for select
to public
using (true);

-- Vendor write (based on auth.uid() matching vendors.user_id)
create policy "Vendors can manage their albums"
on "public"."vendor_albums"
for all
to authenticated
using (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_albums.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_albums.vendor_id
      and v.user_id = auth.uid()
  )
);

create policy "Vendors can manage their album photos"
on "public"."vendor_album_photos"
for all
to authenticated
using (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_album_photos.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_album_photos.vendor_id
      and v.user_id = auth.uid()
  )
);
