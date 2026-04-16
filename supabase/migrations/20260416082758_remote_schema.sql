drop extension if exists "pg_net";

create sequence "public"."affiliations_id_seq";

create sequence "public"."album_photos_id_seq";

create sequence "public"."bridal_fairs_id_seq";

create sequence "public"."categories_id_seq";

create sequence "public"."fair_registrations_id_seq";

create sequence "public"."inquiries_id_seq";

create sequence "public"."plans_id_seq";

create sequence "public"."promos_id_seq";

create sequence "public"."regions_id_seq";

create sequence "public"."reviews_id_seq";

create sequence "public"."soon_to_wed_albums_id_seq";

create sequence "public"."subscriptions_id_seq";

create sequence "public"."vendor_analytics_id_seq";

create sequence "public"."vendor_editors_id_seq";

create sequence "public"."vendor_images_id_seq";

create sequence "public"."vendor_registrations_id_seq";

create sequence "public"."vendor_social_links_id_seq";

create sequence "public"."vendors_id_seq";

create sequence "public"."verification_documents_id_seq";


  create table "public"."affiliations" (
    "id" integer not null default nextval('public.affiliations_id_seq'::regclass),
    "name" character varying(100) not null,
    "slug" character varying(100) not null,
    "badge_icon" character varying(255),
    "description" text,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."affiliations" enable row level security;


  create table "public"."album_photos" (
    "id" integer not null default nextval('public.album_photos_id_seq'::regclass),
    "album_id" integer not null,
    "photo_url" character varying(500) not null,
    "caption" text,
    "display_order" integer default 0,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."album_photos" enable row level security;


  create table "public"."bridal_fairs" (
    "id" integer not null default nextval('public.bridal_fairs_id_seq'::regclass),
    "title" character varying(255) not null,
    "slug" character varying(255) not null,
    "description" text,
    "start_date" date not null,
    "end_date" date,
    "venue" character varying(255) not null,
    "venue_address" text,
    "venue_map_url" character varying(500),
    "image_url" character varying(500),
    "registration_url" character varying(500),
    "is_featured" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."bridal_fairs" enable row level security;


  create table "public"."categories" (
    "id" integer not null default nextval('public.categories_id_seq'::regclass),
    "name" character varying(100) not null,
    "slug" character varying(100) not null,
    "description" text,
    "icon" character varying(255),
    "display_order" integer default 0,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."categories" enable row level security;


  create table "public"."fair_registrations" (
    "id" integer not null default nextval('public.fair_registrations_id_seq'::regclass),
    "fair_id" integer not null,
    "user_id" uuid,
    "name" character varying(255) not null,
    "email" character varying(255) not null,
    "phone" character varying(50),
    "wedding_date" date,
    "notes" text,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."fair_registrations" enable row level security;


  create table "public"."inquiries" (
    "id" integer not null default nextval('public.inquiries_id_seq'::regclass),
    "vendor_id" integer not null,
    "user_id" uuid,
    "name" character varying(255),
    "email" character varying(255),
    "phone" character varying(50),
    "wedding_date" date,
    "message" text not null,
    "status" character varying(20) default 'new'::character varying,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."inquiries" enable row level security;


  create table "public"."plans" (
    "id" integer not null default nextval('public.plans_id_seq'::regclass),
    "name" character varying(50) not null,
    "price" numeric(10,2) not null default 0,
    "description" text,
    "features" jsonb,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."plans" enable row level security;


  create table "public"."promos" (
    "id" integer not null default nextval('public.promos_id_seq'::regclass),
    "vendor_id" integer not null,
    "title" character varying(255) not null,
    "summary" text,
    "terms" text,
    "valid_from" date,
    "valid_to" date,
    "is_featured" boolean default false,
    "image_url" character varying(500),
    "discount_percentage" integer,
    "save_count" integer default 0,
    "is_active" boolean default true,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "image_focus_x" numeric(5,2),
    "image_focus_y" numeric(5,2),
    "image_zoom" numeric(6,3)
      );


alter table "public"."promos" enable row level security;


  create table "public"."regions" (
    "id" integer not null default nextval('public.regions_id_seq'::regclass),
    "name" character varying(100) not null,
    "parent_id" integer,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."regions" enable row level security;


  create table "public"."reviews" (
    "id" integer not null default nextval('public.reviews_id_seq'::regclass),
    "vendor_id" integer not null,
    "user_id" uuid not null,
    "rating" integer not null,
    "review_text" text,
    "status" character varying(20) default 'published'::character varying,
    "helpful_count" integer default 0,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."reviews" enable row level security;


  create table "public"."saved_promos" (
    "user_id" uuid not null,
    "promo_id" integer not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."saved_promos" enable row level security;


  create table "public"."saved_vendors" (
    "user_id" uuid not null,
    "vendor_id" integer not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."saved_vendors" enable row level security;


  create table "public"."soon_to_wed_albums" (
    "id" integer not null default nextval('public.soon_to_wed_albums_id_seq'::regclass),
    "user_id" uuid not null,
    "title" character varying(255) default 'My Wedding Album'::character varying,
    "visibility" character varying(20) default 'private'::character varying,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."soon_to_wed_albums" enable row level security;


  create table "public"."soon_to_wed_profiles" (
    "user_id" uuid not null,
    "bride_nickname" character varying(100),
    "groom_nickname" character varying(100),
    "wedding_date" date,
    "wedding_date_public" boolean default false,
    "wedding_venue_area" character varying(255),
    "wedding_venue_public" boolean default false,
    "location" character varying(255),
    "profile_visibility" character varying(20) default 'private'::character varying,
    "budget_range" character varying(50),
    "wedding_style" character varying(100),
    "notes" text,
    "profile_photo_url" character varying(500),
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."soon_to_wed_profiles" enable row level security;


  create table "public"."staging table" (
    "Brand Count: 754" bigint not null,
    "business_name" text,
    "slug" text,
    "Logo" text,
    "Tax Identification Number" text,
    "address" text,
    "location_text" text,
    "Number of Years in Business" text,
    "contact_email" text,
    "website_url" text,
    "Facebook Page" text,
    "Instagram Account" text,
    "Category" text,
    "Authorized Representative - First Name" text,
    "Authorized Representative - Last Name" text,
    "Designation / Position" text,
    "contact_phone" text,
    "Viber" text,
    "Facebook Messenger" text,
    "Contact Person for the Exhibit - First Name" text,
    "Contact Person for the Exhibit - Last Name" text,
    "Designation / Position_1" text,
    "Mobile Number" text,
    "Viber_1" text,
    "Facebook Messenger_1" text,
    "Affiliation" text
      );


alter table "public"."staging table" enable row level security;


  create table "public"."subscriptions" (
    "id" integer not null default nextval('public.subscriptions_id_seq'::regclass),
    "vendor_id" integer not null,
    "plan_id" integer not null,
    "status" character varying(20) default 'active'::character varying,
    "start_date" date not null,
    "end_date" date,
    "renewal_date" date,
    "provider" character varying(50),
    "provider_customer_id" character varying(255),
    "provider_subscription_id" character varying(255),
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" character varying(255) not null,
    "role" character varying(20) not null,
    "email_verified" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "last_login_at" timestamp without time zone
      );


alter table "public"."users" enable row level security;


  create table "public"."vendor_affiliations" (
    "vendor_id" integer not null,
    "affiliation_id" integer not null,
    "awarded_at" timestamp without time zone default CURRENT_TIMESTAMP
      );


alter table "public"."vendor_affiliations" enable row level security;


  create table "public"."vendor_analytics" (
    "id" integer not null default nextval('public.vendor_analytics_id_seq'::regclass),
    "vendor_id" integer not null,
    "date" date not null,
    "views" integer default 0,
    "saves" integer default 0,
    "inquiries" integer default 0,
    "website_clicks" integer default 0,
    "phone_clicks" integer default 0,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."vendor_analytics" enable row level security;


  create table "public"."vendor_categories" (
    "vendor_id" integer not null,
    "category_id" integer not null,
    "is_primary" boolean default false
      );


alter table "public"."vendor_categories" enable row level security;


  create table "public"."vendor_editors" (
    "id" bigint not null default nextval('public.vendor_editors_id_seq'::regclass),
    "vendor_id" integer not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."vendor_images" (
    "id" integer not null default nextval('public.vendor_images_id_seq'::regclass),
    "vendor_id" integer not null,
    "image_url" character varying(500) not null,
    "caption" text,
    "display_order" integer default 0,
    "is_cover" boolean default false,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "focus_x" numeric(5,2) default 50,
    "focus_y" numeric(5,2) default 50,
    "zoom" numeric(3,2) default 1
      );


alter table "public"."vendor_images" enable row level security;


  create table "public"."vendor_registrations" (
    "id" integer not null default nextval('public.vendor_registrations_id_seq'::regclass),
    "submitted_by_user_id" uuid,
    "business_name" character varying(255) not null,
    "contact_email" character varying(255) not null,
    "contact_phone" character varying(50),
    "category_id" integer,
    "location" character varying(255),
    "description" text,
    "website_url" character varying(500),
    "plan_id" integer,
    "status" character varying(20) default 'submitted'::character varying,
    "admin_notes" text,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "reviewed_at" timestamp without time zone,
    "reviewed_by" uuid,
    "extra" jsonb,
    "sec_dti_number" character varying(100)
      );


alter table "public"."vendor_registrations" enable row level security;


  create table "public"."vendor_social_links" (
    "id" integer not null default nextval('public.vendor_social_links_id_seq'::regclass),
    "vendor_id" integer not null,
    "platform" character varying(50) not null,
    "url" character varying(500) not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."vendor_social_links" enable row level security;


  create table "public"."vendors" (
    "id" integer not null default nextval('public.vendors_id_seq'::regclass),
    "user_id" uuid,
    "business_name" character varying(255) not null,
    "slug" character varying(255) not null,
    "description" text,
    "location_text" character varying(255),
    "region_id" integer,
    "city" character varying(100),
    "address" text,
    "map_url" character varying(500),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "starting_price" numeric(10,2),
    "price_range" character varying(50),
    "contact_email" character varying(255),
    "contact_phone" character varying(50),
    "website_url" character varying(500),
    "verified_status" character varying(20) default 'unverified'::character varying,
    "plan_id" integer,
    "is_active" boolean default true,
    "is_featured" boolean default false,
    "view_count" integer default 0,
    "save_count" integer default 0,
    "inquiry_count" integer default 0,
    "click_count" integer default 0,
    "average_rating" numeric(3,2) default 0,
    "review_count" integer default 0,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "logo_url" text,
    "cover_focus_x" integer default 50,
    "cover_focus_y" integer default 50,
    "cover_zoom" numeric default 1,
    "sec_dti_number" character varying(100)
      );


alter table "public"."vendors" enable row level security;


  create table "public"."verification_documents" (
    "id" integer not null default nextval('public.verification_documents_id_seq'::regclass),
    "vendor_id" integer,
    "registration_id" integer,
    "doc_type" character varying(50) not null,
    "file_url" character varying(500) not null,
    "file_name" character varying(255),
    "status" character varying(20) default 'pending'::character varying,
    "uploaded_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "reviewed_at" timestamp without time zone,
    "notes" text
      );


alter table "public"."verification_documents" enable row level security;

alter table "public"."superadmin_sessions" alter column "id" set default gen_random_uuid();

alter table "public"."superadmin_sessions" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."superadmin_sessions" alter column "superadmin_id" set data type uuid using "superadmin_id"::uuid;

alter table "public"."superadmin_sessions" enable row level security;

alter table "public"."superadmins" add column "is_active" boolean not null default true;

alter table "public"."superadmins" alter column "id" set default gen_random_uuid();

alter table "public"."superadmins" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."superadmins" enable row level security;

alter sequence "public"."affiliations_id_seq" owned by "public"."affiliations"."id";

alter sequence "public"."album_photos_id_seq" owned by "public"."album_photos"."id";

alter sequence "public"."bridal_fairs_id_seq" owned by "public"."bridal_fairs"."id";

alter sequence "public"."categories_id_seq" owned by "public"."categories"."id";

alter sequence "public"."fair_registrations_id_seq" owned by "public"."fair_registrations"."id";

alter sequence "public"."inquiries_id_seq" owned by "public"."inquiries"."id";

alter sequence "public"."plans_id_seq" owned by "public"."plans"."id";

alter sequence "public"."promos_id_seq" owned by "public"."promos"."id";

alter sequence "public"."regions_id_seq" owned by "public"."regions"."id";

alter sequence "public"."reviews_id_seq" owned by "public"."reviews"."id";

alter sequence "public"."soon_to_wed_albums_id_seq" owned by "public"."soon_to_wed_albums"."id";

alter sequence "public"."subscriptions_id_seq" owned by "public"."subscriptions"."id";

alter sequence "public"."vendor_analytics_id_seq" owned by "public"."vendor_analytics"."id";

alter sequence "public"."vendor_editors_id_seq" owned by "public"."vendor_editors"."id";

alter sequence "public"."vendor_images_id_seq" owned by "public"."vendor_images"."id";

alter sequence "public"."vendor_registrations_id_seq" owned by "public"."vendor_registrations"."id";

alter sequence "public"."vendor_social_links_id_seq" owned by "public"."vendor_social_links"."id";

alter sequence "public"."vendors_id_seq" owned by "public"."vendors"."id";

alter sequence "public"."verification_documents_id_seq" owned by "public"."verification_documents"."id";

drop sequence if exists "public"."superadmin_sessions_id_seq";

drop sequence if exists "public"."superadmins_id_seq";

CREATE UNIQUE INDEX affiliations_name_key ON public.affiliations USING btree (name);

CREATE UNIQUE INDEX affiliations_pkey ON public.affiliations USING btree (id);

CREATE UNIQUE INDEX affiliations_slug_key ON public.affiliations USING btree (slug);

CREATE UNIQUE INDEX album_photos_pkey ON public.album_photos USING btree (id);

CREATE UNIQUE INDEX bridal_fairs_pkey ON public.bridal_fairs USING btree (id);

CREATE UNIQUE INDEX bridal_fairs_slug_key ON public.bridal_fairs USING btree (slug);

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE UNIQUE INDEX fair_registrations_pkey ON public.fair_registrations USING btree (id);

CREATE INDEX idx_album_photos_album ON public.album_photos USING btree (album_id);

CREATE INDEX idx_albums_user ON public.soon_to_wed_albums USING btree (user_id);

CREATE INDEX idx_analytics_vendor_date ON public.vendor_analytics USING btree (vendor_id, date);

CREATE INDEX idx_fair_registrations_fair ON public.fair_registrations USING btree (fair_id);

CREATE INDEX idx_fair_registrations_user ON public.fair_registrations USING btree (user_id);

CREATE INDEX idx_fairs_active ON public.bridal_fairs USING btree (is_active);

CREATE INDEX idx_fairs_dates ON public.bridal_fairs USING btree (start_date, end_date);

CREATE INDEX idx_inquiries_created ON public.inquiries USING btree (created_at);

CREATE INDEX idx_inquiries_status ON public.inquiries USING btree (status);

CREATE INDEX idx_inquiries_user ON public.inquiries USING btree (user_id);

CREATE INDEX idx_inquiries_vendor ON public.inquiries USING btree (vendor_id);

CREATE INDEX idx_promos_active ON public.promos USING btree (is_active);

CREATE INDEX idx_promos_featured ON public.promos USING btree (is_featured);

CREATE INDEX idx_promos_valid ON public.promos USING btree (valid_from, valid_to);

CREATE INDEX idx_promos_vendor ON public.promos USING btree (vendor_id);

CREATE INDEX idx_registrations_status ON public.vendor_registrations USING btree (status);

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);

CREATE INDEX idx_reviews_status ON public.reviews USING btree (status);

CREATE INDEX idx_reviews_user ON public.reviews USING btree (user_id);

CREATE INDEX idx_reviews_vendor ON public.reviews USING btree (vendor_id);

CREATE INDEX idx_saved_promos_user ON public.saved_promos USING btree (user_id);

CREATE INDEX idx_saved_vendors_user ON public.saved_vendors USING btree (user_id);

CREATE INDEX idx_social_links_vendor ON public.vendor_social_links USING btree (vendor_id);

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);

CREATE INDEX idx_subscriptions_vendor ON public.subscriptions USING btree (vendor_id);

CREATE INDEX idx_superadmin_sessions_token ON public.superadmin_sessions USING btree (token);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE INDEX idx_users_role ON public.users USING btree (role);

CREATE INDEX idx_vendor_categories_category ON public.vendor_categories USING btree (category_id);

CREATE INDEX idx_vendor_categories_vendor ON public.vendor_categories USING btree (vendor_id);

CREATE INDEX idx_vendor_editors_user_id ON public.vendor_editors USING btree (user_id);

CREATE INDEX idx_vendor_editors_vendor_id ON public.vendor_editors USING btree (vendor_id);

CREATE INDEX idx_vendor_images_vendor ON public.vendor_images USING btree (vendor_id);

CREATE INDEX idx_vendor_images_vendor_id ON public.vendor_images USING btree (vendor_id);

CREATE INDEX idx_vendor_registrations_sec_dti_number ON public.vendor_registrations USING btree (sec_dti_number);

CREATE INDEX idx_vendors_active ON public.vendors USING btree (is_active);

CREATE INDEX idx_vendors_featured ON public.vendors USING btree (is_featured);

CREATE INDEX idx_vendors_rating ON public.vendors USING btree (average_rating);

CREATE INDEX idx_vendors_region ON public.vendors USING btree (region_id);

CREATE INDEX idx_vendors_sec_dti_number ON public.vendors USING btree (sec_dti_number);

CREATE INDEX idx_vendors_slug ON public.vendors USING btree (slug);

CREATE INDEX idx_vendors_verified ON public.vendors USING btree (verified_status);

CREATE INDEX idx_verification_docs_registration ON public.verification_documents USING btree (registration_id);

CREATE INDEX idx_verification_docs_vendor ON public.verification_documents USING btree (vendor_id);

CREATE UNIQUE INDEX inquiries_pkey ON public.inquiries USING btree (id);

CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX promos_pkey ON public.promos USING btree (id);

CREATE UNIQUE INDEX regions_name_key ON public.regions USING btree (name);

CREATE UNIQUE INDEX regions_name_unique ON public.regions USING btree (name);

CREATE UNIQUE INDEX regions_pkey ON public.regions USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX reviews_vendor_id_user_id_key ON public.reviews USING btree (vendor_id, user_id);

CREATE UNIQUE INDEX saved_promos_pkey ON public.saved_promos USING btree (user_id, promo_id);

CREATE UNIQUE INDEX saved_vendors_pkey ON public.saved_vendors USING btree (user_id, vendor_id);

CREATE UNIQUE INDEX soon_to_wed_albums_pkey ON public.soon_to_wed_albums USING btree (id);

CREATE UNIQUE INDEX soon_to_wed_profiles_pkey ON public.soon_to_wed_profiles USING btree (user_id);

CREATE UNIQUE INDEX "staging table_pkey" ON public."staging table" USING btree ("Brand Count: 754");

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX vendor_affiliations_pkey ON public.vendor_affiliations USING btree (vendor_id, affiliation_id);

CREATE UNIQUE INDEX vendor_analytics_pkey ON public.vendor_analytics USING btree (id);

CREATE UNIQUE INDEX vendor_analytics_vendor_id_date_key ON public.vendor_analytics USING btree (vendor_id, date);

CREATE UNIQUE INDEX vendor_categories_pkey ON public.vendor_categories USING btree (vendor_id, category_id);

CREATE UNIQUE INDEX vendor_editors_pkey ON public.vendor_editors USING btree (id);

CREATE UNIQUE INDEX vendor_editors_vendor_id_user_id_key ON public.vendor_editors USING btree (vendor_id, user_id);

CREATE UNIQUE INDEX vendor_images_pkey ON public.vendor_images USING btree (id);

CREATE UNIQUE INDEX vendor_registrations_pkey ON public.vendor_registrations USING btree (id);

CREATE UNIQUE INDEX vendor_social_links_pkey ON public.vendor_social_links USING btree (id);

CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id);

CREATE UNIQUE INDEX vendors_slug_key ON public.vendors USING btree (slug);

CREATE UNIQUE INDEX verification_documents_pkey ON public.verification_documents USING btree (id);

alter table "public"."affiliations" add constraint "affiliations_pkey" PRIMARY KEY using index "affiliations_pkey";

alter table "public"."album_photos" add constraint "album_photos_pkey" PRIMARY KEY using index "album_photos_pkey";

alter table "public"."bridal_fairs" add constraint "bridal_fairs_pkey" PRIMARY KEY using index "bridal_fairs_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."fair_registrations" add constraint "fair_registrations_pkey" PRIMARY KEY using index "fair_registrations_pkey";

alter table "public"."inquiries" add constraint "inquiries_pkey" PRIMARY KEY using index "inquiries_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."promos" add constraint "promos_pkey" PRIMARY KEY using index "promos_pkey";

alter table "public"."regions" add constraint "regions_pkey" PRIMARY KEY using index "regions_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."saved_promos" add constraint "saved_promos_pkey" PRIMARY KEY using index "saved_promos_pkey";

alter table "public"."saved_vendors" add constraint "saved_vendors_pkey" PRIMARY KEY using index "saved_vendors_pkey";

alter table "public"."soon_to_wed_albums" add constraint "soon_to_wed_albums_pkey" PRIMARY KEY using index "soon_to_wed_albums_pkey";

alter table "public"."soon_to_wed_profiles" add constraint "soon_to_wed_profiles_pkey" PRIMARY KEY using index "soon_to_wed_profiles_pkey";

alter table "public"."staging table" add constraint "staging table_pkey" PRIMARY KEY using index "staging table_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vendor_affiliations" add constraint "vendor_affiliations_pkey" PRIMARY KEY using index "vendor_affiliations_pkey";

alter table "public"."vendor_analytics" add constraint "vendor_analytics_pkey" PRIMARY KEY using index "vendor_analytics_pkey";

alter table "public"."vendor_categories" add constraint "vendor_categories_pkey" PRIMARY KEY using index "vendor_categories_pkey";

alter table "public"."vendor_editors" add constraint "vendor_editors_pkey" PRIMARY KEY using index "vendor_editors_pkey";

alter table "public"."vendor_images" add constraint "vendor_images_pkey" PRIMARY KEY using index "vendor_images_pkey";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_pkey" PRIMARY KEY using index "vendor_registrations_pkey";

alter table "public"."vendor_social_links" add constraint "vendor_social_links_pkey" PRIMARY KEY using index "vendor_social_links_pkey";

alter table "public"."vendors" add constraint "vendors_pkey" PRIMARY KEY using index "vendors_pkey";

alter table "public"."verification_documents" add constraint "verification_documents_pkey" PRIMARY KEY using index "verification_documents_pkey";

alter table "public"."affiliations" add constraint "affiliations_name_key" UNIQUE using index "affiliations_name_key";

alter table "public"."affiliations" add constraint "affiliations_slug_key" UNIQUE using index "affiliations_slug_key";

alter table "public"."album_photos" add constraint "album_photos_album_id_fkey" FOREIGN KEY (album_id) REFERENCES public.soon_to_wed_albums(id) ON DELETE CASCADE not valid;

alter table "public"."album_photos" validate constraint "album_photos_album_id_fkey";

alter table "public"."bridal_fairs" add constraint "bridal_fairs_slug_key" UNIQUE using index "bridal_fairs_slug_key";

alter table "public"."categories" add constraint "categories_name_key" UNIQUE using index "categories_name_key";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."editors" add constraint "editors_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."editors" validate constraint "editors_vendor_id_fkey";

alter table "public"."fair_registrations" add constraint "fair_registrations_fair_id_fkey" FOREIGN KEY (fair_id) REFERENCES public.bridal_fairs(id) ON DELETE CASCADE not valid;

alter table "public"."fair_registrations" validate constraint "fair_registrations_fair_id_fkey";

alter table "public"."fair_registrations" add constraint "fair_registrations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."fair_registrations" validate constraint "fair_registrations_user_id_fkey";

alter table "public"."inquiries" add constraint "inquiries_status_check" CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'read'::character varying, 'replied'::character varying, 'archived'::character varying])::text[]))) not valid;

alter table "public"."inquiries" validate constraint "inquiries_status_check";

alter table "public"."inquiries" add constraint "inquiries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."inquiries" validate constraint "inquiries_user_id_fkey";

alter table "public"."inquiries" add constraint "inquiries_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."inquiries" validate constraint "inquiries_vendor_id_fkey";

alter table "public"."plans" add constraint "plans_name_key" UNIQUE using index "plans_name_key";

alter table "public"."promos" add constraint "promos_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."promos" validate constraint "promos_vendor_id_fkey";

alter table "public"."regions" add constraint "regions_name_key" UNIQUE using index "regions_name_key";

alter table "public"."regions" add constraint "regions_name_unique" UNIQUE using index "regions_name_unique";

alter table "public"."regions" add constraint "regions_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.regions(id) not valid;

alter table "public"."regions" validate constraint "regions_parent_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_status_check" CHECK (((status)::text = ANY ((ARRAY['published'::character varying, 'pending'::character varying, 'flagged'::character varying, 'removed'::character varying])::text[]))) not valid;

alter table "public"."reviews" validate constraint "reviews_status_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."reviews" add constraint "reviews_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_vendor_id_fkey";

alter table "public"."reviews" add constraint "reviews_vendor_id_user_id_key" UNIQUE using index "reviews_vendor_id_user_id_key";

alter table "public"."saved_promos" add constraint "saved_promos_promo_id_fkey" FOREIGN KEY (promo_id) REFERENCES public.promos(id) ON DELETE CASCADE not valid;

alter table "public"."saved_promos" validate constraint "saved_promos_promo_id_fkey";

alter table "public"."saved_promos" add constraint "saved_promos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_promos" validate constraint "saved_promos_user_id_fkey";

alter table "public"."saved_vendors" add constraint "saved_vendors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_vendors" validate constraint "saved_vendors_user_id_fkey";

alter table "public"."saved_vendors" add constraint "saved_vendors_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."saved_vendors" validate constraint "saved_vendors_vendor_id_fkey";

alter table "public"."soon_to_wed_albums" add constraint "soon_to_wed_albums_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."soon_to_wed_albums" validate constraint "soon_to_wed_albums_user_id_fkey";

alter table "public"."soon_to_wed_albums" add constraint "soon_to_wed_albums_visibility_check" CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[]))) not valid;

alter table "public"."soon_to_wed_albums" validate constraint "soon_to_wed_albums_visibility_check";

alter table "public"."soon_to_wed_profiles" add constraint "soon_to_wed_profiles_profile_visibility_check" CHECK (((profile_visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[]))) not valid;

alter table "public"."soon_to_wed_profiles" validate constraint "soon_to_wed_profiles_profile_visibility_check";

alter table "public"."soon_to_wed_profiles" add constraint "soon_to_wed_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."soon_to_wed_profiles" validate constraint "soon_to_wed_profiles_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.plans(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_status_check" CHECK (((status)::text = ANY ((ARRAY['trial'::character varying, 'active'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'expired'::character varying])::text[]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_status_check";

alter table "public"."subscriptions" add constraint "subscriptions_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_vendor_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_role_check" CHECK (((role)::text = ANY ((ARRAY['soon_to_wed'::character varying, 'supplier'::character varying, 'admin'::character varying])::text[]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

alter table "public"."vendor_affiliations" add constraint "vendor_affiliations_affiliation_id_fkey" FOREIGN KEY (affiliation_id) REFERENCES public.affiliations(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_affiliations" validate constraint "vendor_affiliations_affiliation_id_fkey";

alter table "public"."vendor_affiliations" add constraint "vendor_affiliations_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_affiliations" validate constraint "vendor_affiliations_vendor_id_fkey";

alter table "public"."vendor_analytics" add constraint "vendor_analytics_vendor_id_date_key" UNIQUE using index "vendor_analytics_vendor_id_date_key";

alter table "public"."vendor_analytics" add constraint "vendor_analytics_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_analytics" validate constraint "vendor_analytics_vendor_id_fkey";

alter table "public"."vendor_categories" add constraint "vendor_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_categories" validate constraint "vendor_categories_category_id_fkey";

alter table "public"."vendor_categories" add constraint "vendor_categories_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_categories" validate constraint "vendor_categories_vendor_id_fkey";

alter table "public"."vendor_editors" add constraint "vendor_editors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_editors" validate constraint "vendor_editors_user_id_fkey";

alter table "public"."vendor_editors" add constraint "vendor_editors_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_editors" validate constraint "vendor_editors_vendor_id_fkey";

alter table "public"."vendor_editors" add constraint "vendor_editors_vendor_id_user_id_key" UNIQUE using index "vendor_editors_vendor_id_user_id_key";

alter table "public"."vendor_images" add constraint "vendor_images_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_images" validate constraint "vendor_images_vendor_id_fkey";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) not valid;

alter table "public"."vendor_registrations" validate constraint "vendor_registrations_category_id_fkey";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.plans(id) not valid;

alter table "public"."vendor_registrations" validate constraint "vendor_registrations_plan_id_fkey";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) not valid;

alter table "public"."vendor_registrations" validate constraint "vendor_registrations_reviewed_by_fkey";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_status_check" CHECK (((status)::text = ANY ((ARRAY['submitted'::character varying, 'in_review'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."vendor_registrations" validate constraint "vendor_registrations_status_check";

alter table "public"."vendor_registrations" add constraint "vendor_registrations_submitted_by_user_id_fkey" FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."vendor_registrations" validate constraint "vendor_registrations_submitted_by_user_id_fkey";

alter table "public"."vendor_social_links" add constraint "vendor_social_links_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_social_links" validate constraint "vendor_social_links_vendor_id_fkey";

alter table "public"."vendors" add constraint "vendors_cover_focus_x_check" CHECK (((cover_focus_x IS NULL) OR ((cover_focus_x >= 0) AND (cover_focus_x <= 100)))) not valid;

alter table "public"."vendors" validate constraint "vendors_cover_focus_x_check";

alter table "public"."vendors" add constraint "vendors_cover_focus_y_check" CHECK (((cover_focus_y IS NULL) OR ((cover_focus_y >= 0) AND (cover_focus_y <= 100)))) not valid;

alter table "public"."vendors" validate constraint "vendors_cover_focus_y_check";

alter table "public"."vendors" add constraint "vendors_cover_zoom_check" CHECK (((cover_zoom IS NULL) OR ((cover_zoom >= (1)::numeric) AND (cover_zoom <= (3)::numeric)))) not valid;

alter table "public"."vendors" validate constraint "vendors_cover_zoom_check";

alter table "public"."vendors" add constraint "vendors_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.plans(id) not valid;

alter table "public"."vendors" validate constraint "vendors_plan_id_fkey";

alter table "public"."vendors" add constraint "vendors_region_id_fkey" FOREIGN KEY (region_id) REFERENCES public.regions(id) not valid;

alter table "public"."vendors" validate constraint "vendors_region_id_fkey";

alter table "public"."vendors" add constraint "vendors_slug_key" UNIQUE using index "vendors_slug_key";

alter table "public"."vendors" add constraint "vendors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."vendors" validate constraint "vendors_user_id_fkey";

alter table "public"."vendors" add constraint "vendors_verified_status_check" CHECK (((verified_status)::text = ANY ((ARRAY['unverified'::character varying, 'pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."vendors" validate constraint "vendors_verified_status_check";

alter table "public"."verification_documents" add constraint "verification_documents_doc_type_check" CHECK (((doc_type)::text = ANY ((ARRAY['business_permit'::character varying, 'dti'::character varying, 'sec'::character varying, 'bir'::character varying, 'other'::character varying])::text[]))) not valid;

alter table "public"."verification_documents" validate constraint "verification_documents_doc_type_check";

alter table "public"."verification_documents" add constraint "verification_documents_registration_id_fkey" FOREIGN KEY (registration_id) REFERENCES public.vendor_registrations(id) ON DELETE CASCADE not valid;

alter table "public"."verification_documents" validate constraint "verification_documents_registration_id_fkey";

alter table "public"."verification_documents" add constraint "verification_documents_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."verification_documents" validate constraint "verification_documents_status_check";

alter table "public"."verification_documents" add constraint "verification_documents_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."verification_documents" validate constraint "verification_documents_vendor_id_fkey";

set check_function_bodies = off;

create or replace view "public"."active_promos" as  SELECT p.id,
    p.vendor_id,
    p.title,
    p.summary,
    p.terms,
    p.valid_from,
    p.valid_to,
    p.is_featured,
    p.image_url,
    p.discount_percentage,
    p.save_count,
    p.is_active,
    p.created_at,
    p.updated_at,
    v.business_name AS vendor_name,
    v.slug AS vendor_slug
   FROM (public.promos p
     JOIN public.vendors v ON ((p.vendor_id = v.id)))
  WHERE ((p.is_active = true) AND ((p.valid_to IS NULL) OR (p.valid_to >= CURRENT_DATE)) AND ((p.valid_from IS NULL) OR (p.valid_from <= CURRENT_DATE)));


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email, role, email_verified)
  values (
    new.id,
    new.email,
    'soon_to_wed',
    new.email_confirmed_at is not null
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'admin'
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_supplier()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'supplier'
  )
$function$
;

CREATE OR REPLACE FUNCTION public.owns_vendor(vendor_id_input integer)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.vendors 
    WHERE id = vendor_id_input 
    AND user_id = auth.uid()
  )
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT role FROM public.users WHERE id = auth.uid()
$function$
;

create or replace view "public"."vendor_details" as  SELECT v.id,
    v.business_name,
    v.slug,
    v.description,
    v.location_text,
    v.starting_price,
    v.contact_email,
    v.contact_phone,
    v.website_url,
    v.verified_status,
    v.is_featured,
    v.average_rating,
    v.review_count,
    v.view_count,
    v.save_count,
    p.name AS plan_name,
    u.email AS owner_email
   FROM ((public.vendors v
     LEFT JOIN public.plans p ON ((v.plan_id = p.id)))
     LEFT JOIN public.users u ON ((v.user_id = u.id)))
  WHERE (v.is_active = true);


grant delete on table "public"."affiliations" to "anon";

grant insert on table "public"."affiliations" to "anon";

grant references on table "public"."affiliations" to "anon";

grant select on table "public"."affiliations" to "anon";

grant trigger on table "public"."affiliations" to "anon";

grant truncate on table "public"."affiliations" to "anon";

grant update on table "public"."affiliations" to "anon";

grant delete on table "public"."affiliations" to "authenticated";

grant insert on table "public"."affiliations" to "authenticated";

grant references on table "public"."affiliations" to "authenticated";

grant select on table "public"."affiliations" to "authenticated";

grant trigger on table "public"."affiliations" to "authenticated";

grant truncate on table "public"."affiliations" to "authenticated";

grant update on table "public"."affiliations" to "authenticated";

grant delete on table "public"."affiliations" to "prisma";

grant insert on table "public"."affiliations" to "prisma";

grant references on table "public"."affiliations" to "prisma";

grant select on table "public"."affiliations" to "prisma";

grant trigger on table "public"."affiliations" to "prisma";

grant truncate on table "public"."affiliations" to "prisma";

grant update on table "public"."affiliations" to "prisma";

grant delete on table "public"."affiliations" to "service_role";

grant insert on table "public"."affiliations" to "service_role";

grant references on table "public"."affiliations" to "service_role";

grant select on table "public"."affiliations" to "service_role";

grant trigger on table "public"."affiliations" to "service_role";

grant truncate on table "public"."affiliations" to "service_role";

grant update on table "public"."affiliations" to "service_role";

grant delete on table "public"."album_photos" to "anon";

grant insert on table "public"."album_photos" to "anon";

grant references on table "public"."album_photos" to "anon";

grant select on table "public"."album_photos" to "anon";

grant trigger on table "public"."album_photos" to "anon";

grant truncate on table "public"."album_photos" to "anon";

grant update on table "public"."album_photos" to "anon";

grant delete on table "public"."album_photos" to "authenticated";

grant insert on table "public"."album_photos" to "authenticated";

grant references on table "public"."album_photos" to "authenticated";

grant select on table "public"."album_photos" to "authenticated";

grant trigger on table "public"."album_photos" to "authenticated";

grant truncate on table "public"."album_photos" to "authenticated";

grant update on table "public"."album_photos" to "authenticated";

grant delete on table "public"."album_photos" to "prisma";

grant insert on table "public"."album_photos" to "prisma";

grant references on table "public"."album_photos" to "prisma";

grant select on table "public"."album_photos" to "prisma";

grant trigger on table "public"."album_photos" to "prisma";

grant truncate on table "public"."album_photos" to "prisma";

grant update on table "public"."album_photos" to "prisma";

grant delete on table "public"."album_photos" to "service_role";

grant insert on table "public"."album_photos" to "service_role";

grant references on table "public"."album_photos" to "service_role";

grant select on table "public"."album_photos" to "service_role";

grant trigger on table "public"."album_photos" to "service_role";

grant truncate on table "public"."album_photos" to "service_role";

grant update on table "public"."album_photos" to "service_role";

grant delete on table "public"."bridal_fairs" to "anon";

grant insert on table "public"."bridal_fairs" to "anon";

grant references on table "public"."bridal_fairs" to "anon";

grant select on table "public"."bridal_fairs" to "anon";

grant trigger on table "public"."bridal_fairs" to "anon";

grant truncate on table "public"."bridal_fairs" to "anon";

grant update on table "public"."bridal_fairs" to "anon";

grant delete on table "public"."bridal_fairs" to "authenticated";

grant insert on table "public"."bridal_fairs" to "authenticated";

grant references on table "public"."bridal_fairs" to "authenticated";

grant select on table "public"."bridal_fairs" to "authenticated";

grant trigger on table "public"."bridal_fairs" to "authenticated";

grant truncate on table "public"."bridal_fairs" to "authenticated";

grant update on table "public"."bridal_fairs" to "authenticated";

grant delete on table "public"."bridal_fairs" to "prisma";

grant insert on table "public"."bridal_fairs" to "prisma";

grant references on table "public"."bridal_fairs" to "prisma";

grant select on table "public"."bridal_fairs" to "prisma";

grant trigger on table "public"."bridal_fairs" to "prisma";

grant truncate on table "public"."bridal_fairs" to "prisma";

grant update on table "public"."bridal_fairs" to "prisma";

grant delete on table "public"."bridal_fairs" to "service_role";

grant insert on table "public"."bridal_fairs" to "service_role";

grant references on table "public"."bridal_fairs" to "service_role";

grant select on table "public"."bridal_fairs" to "service_role";

grant trigger on table "public"."bridal_fairs" to "service_role";

grant truncate on table "public"."bridal_fairs" to "service_role";

grant update on table "public"."bridal_fairs" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "prisma";

grant insert on table "public"."categories" to "prisma";

grant references on table "public"."categories" to "prisma";

grant select on table "public"."categories" to "prisma";

grant trigger on table "public"."categories" to "prisma";

grant truncate on table "public"."categories" to "prisma";

grant update on table "public"."categories" to "prisma";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."editors" to "prisma";

grant insert on table "public"."editors" to "prisma";

grant references on table "public"."editors" to "prisma";

grant select on table "public"."editors" to "prisma";

grant trigger on table "public"."editors" to "prisma";

grant truncate on table "public"."editors" to "prisma";

grant update on table "public"."editors" to "prisma";

grant delete on table "public"."fair_registrations" to "anon";

grant insert on table "public"."fair_registrations" to "anon";

grant references on table "public"."fair_registrations" to "anon";

grant select on table "public"."fair_registrations" to "anon";

grant trigger on table "public"."fair_registrations" to "anon";

grant truncate on table "public"."fair_registrations" to "anon";

grant update on table "public"."fair_registrations" to "anon";

grant delete on table "public"."fair_registrations" to "authenticated";

grant insert on table "public"."fair_registrations" to "authenticated";

grant references on table "public"."fair_registrations" to "authenticated";

grant select on table "public"."fair_registrations" to "authenticated";

grant trigger on table "public"."fair_registrations" to "authenticated";

grant truncate on table "public"."fair_registrations" to "authenticated";

grant update on table "public"."fair_registrations" to "authenticated";

grant delete on table "public"."fair_registrations" to "prisma";

grant insert on table "public"."fair_registrations" to "prisma";

grant references on table "public"."fair_registrations" to "prisma";

grant select on table "public"."fair_registrations" to "prisma";

grant trigger on table "public"."fair_registrations" to "prisma";

grant truncate on table "public"."fair_registrations" to "prisma";

grant update on table "public"."fair_registrations" to "prisma";

grant delete on table "public"."fair_registrations" to "service_role";

grant insert on table "public"."fair_registrations" to "service_role";

grant references on table "public"."fair_registrations" to "service_role";

grant select on table "public"."fair_registrations" to "service_role";

grant trigger on table "public"."fair_registrations" to "service_role";

grant truncate on table "public"."fair_registrations" to "service_role";

grant update on table "public"."fair_registrations" to "service_role";

grant delete on table "public"."inquiries" to "anon";

grant insert on table "public"."inquiries" to "anon";

grant references on table "public"."inquiries" to "anon";

grant select on table "public"."inquiries" to "anon";

grant trigger on table "public"."inquiries" to "anon";

grant truncate on table "public"."inquiries" to "anon";

grant update on table "public"."inquiries" to "anon";

grant delete on table "public"."inquiries" to "authenticated";

grant insert on table "public"."inquiries" to "authenticated";

grant references on table "public"."inquiries" to "authenticated";

grant select on table "public"."inquiries" to "authenticated";

grant trigger on table "public"."inquiries" to "authenticated";

grant truncate on table "public"."inquiries" to "authenticated";

grant update on table "public"."inquiries" to "authenticated";

grant delete on table "public"."inquiries" to "prisma";

grant insert on table "public"."inquiries" to "prisma";

grant references on table "public"."inquiries" to "prisma";

grant select on table "public"."inquiries" to "prisma";

grant trigger on table "public"."inquiries" to "prisma";

grant truncate on table "public"."inquiries" to "prisma";

grant update on table "public"."inquiries" to "prisma";

grant delete on table "public"."inquiries" to "service_role";

grant insert on table "public"."inquiries" to "service_role";

grant references on table "public"."inquiries" to "service_role";

grant select on table "public"."inquiries" to "service_role";

grant trigger on table "public"."inquiries" to "service_role";

grant truncate on table "public"."inquiries" to "service_role";

grant update on table "public"."inquiries" to "service_role";

grant delete on table "public"."plans" to "anon";

grant insert on table "public"."plans" to "anon";

grant references on table "public"."plans" to "anon";

grant select on table "public"."plans" to "anon";

grant trigger on table "public"."plans" to "anon";

grant truncate on table "public"."plans" to "anon";

grant update on table "public"."plans" to "anon";

grant delete on table "public"."plans" to "authenticated";

grant insert on table "public"."plans" to "authenticated";

grant references on table "public"."plans" to "authenticated";

grant select on table "public"."plans" to "authenticated";

grant trigger on table "public"."plans" to "authenticated";

grant truncate on table "public"."plans" to "authenticated";

grant update on table "public"."plans" to "authenticated";

grant delete on table "public"."plans" to "prisma";

grant insert on table "public"."plans" to "prisma";

grant references on table "public"."plans" to "prisma";

grant select on table "public"."plans" to "prisma";

grant trigger on table "public"."plans" to "prisma";

grant truncate on table "public"."plans" to "prisma";

grant update on table "public"."plans" to "prisma";

grant delete on table "public"."plans" to "service_role";

grant insert on table "public"."plans" to "service_role";

grant references on table "public"."plans" to "service_role";

grant select on table "public"."plans" to "service_role";

grant trigger on table "public"."plans" to "service_role";

grant truncate on table "public"."plans" to "service_role";

grant update on table "public"."plans" to "service_role";

grant delete on table "public"."promos" to "anon";

grant insert on table "public"."promos" to "anon";

grant references on table "public"."promos" to "anon";

grant select on table "public"."promos" to "anon";

grant trigger on table "public"."promos" to "anon";

grant truncate on table "public"."promos" to "anon";

grant update on table "public"."promos" to "anon";

grant delete on table "public"."promos" to "authenticated";

grant insert on table "public"."promos" to "authenticated";

grant references on table "public"."promos" to "authenticated";

grant select on table "public"."promos" to "authenticated";

grant trigger on table "public"."promos" to "authenticated";

grant truncate on table "public"."promos" to "authenticated";

grant update on table "public"."promos" to "authenticated";

grant delete on table "public"."promos" to "prisma";

grant insert on table "public"."promos" to "prisma";

grant references on table "public"."promos" to "prisma";

grant select on table "public"."promos" to "prisma";

grant trigger on table "public"."promos" to "prisma";

grant truncate on table "public"."promos" to "prisma";

grant update on table "public"."promos" to "prisma";

grant delete on table "public"."promos" to "service_role";

grant insert on table "public"."promos" to "service_role";

grant references on table "public"."promos" to "service_role";

grant select on table "public"."promos" to "service_role";

grant trigger on table "public"."promos" to "service_role";

grant truncate on table "public"."promos" to "service_role";

grant update on table "public"."promos" to "service_role";

grant delete on table "public"."regions" to "anon";

grant insert on table "public"."regions" to "anon";

grant references on table "public"."regions" to "anon";

grant select on table "public"."regions" to "anon";

grant trigger on table "public"."regions" to "anon";

grant truncate on table "public"."regions" to "anon";

grant update on table "public"."regions" to "anon";

grant delete on table "public"."regions" to "authenticated";

grant insert on table "public"."regions" to "authenticated";

grant references on table "public"."regions" to "authenticated";

grant select on table "public"."regions" to "authenticated";

grant trigger on table "public"."regions" to "authenticated";

grant truncate on table "public"."regions" to "authenticated";

grant update on table "public"."regions" to "authenticated";

grant delete on table "public"."regions" to "prisma";

grant insert on table "public"."regions" to "prisma";

grant references on table "public"."regions" to "prisma";

grant select on table "public"."regions" to "prisma";

grant trigger on table "public"."regions" to "prisma";

grant truncate on table "public"."regions" to "prisma";

grant update on table "public"."regions" to "prisma";

grant delete on table "public"."regions" to "service_role";

grant insert on table "public"."regions" to "service_role";

grant references on table "public"."regions" to "service_role";

grant select on table "public"."regions" to "service_role";

grant trigger on table "public"."regions" to "service_role";

grant truncate on table "public"."regions" to "service_role";

grant update on table "public"."regions" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "prisma";

grant insert on table "public"."reviews" to "prisma";

grant references on table "public"."reviews" to "prisma";

grant select on table "public"."reviews" to "prisma";

grant trigger on table "public"."reviews" to "prisma";

grant truncate on table "public"."reviews" to "prisma";

grant update on table "public"."reviews" to "prisma";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."saved_promos" to "anon";

grant insert on table "public"."saved_promos" to "anon";

grant references on table "public"."saved_promos" to "anon";

grant select on table "public"."saved_promos" to "anon";

grant trigger on table "public"."saved_promos" to "anon";

grant truncate on table "public"."saved_promos" to "anon";

grant update on table "public"."saved_promos" to "anon";

grant delete on table "public"."saved_promos" to "authenticated";

grant insert on table "public"."saved_promos" to "authenticated";

grant references on table "public"."saved_promos" to "authenticated";

grant select on table "public"."saved_promos" to "authenticated";

grant trigger on table "public"."saved_promos" to "authenticated";

grant truncate on table "public"."saved_promos" to "authenticated";

grant update on table "public"."saved_promos" to "authenticated";

grant delete on table "public"."saved_promos" to "prisma";

grant insert on table "public"."saved_promos" to "prisma";

grant references on table "public"."saved_promos" to "prisma";

grant select on table "public"."saved_promos" to "prisma";

grant trigger on table "public"."saved_promos" to "prisma";

grant truncate on table "public"."saved_promos" to "prisma";

grant update on table "public"."saved_promos" to "prisma";

grant delete on table "public"."saved_promos" to "service_role";

grant insert on table "public"."saved_promos" to "service_role";

grant references on table "public"."saved_promos" to "service_role";

grant select on table "public"."saved_promos" to "service_role";

grant trigger on table "public"."saved_promos" to "service_role";

grant truncate on table "public"."saved_promos" to "service_role";

grant update on table "public"."saved_promos" to "service_role";

grant delete on table "public"."saved_vendors" to "anon";

grant insert on table "public"."saved_vendors" to "anon";

grant references on table "public"."saved_vendors" to "anon";

grant select on table "public"."saved_vendors" to "anon";

grant trigger on table "public"."saved_vendors" to "anon";

grant truncate on table "public"."saved_vendors" to "anon";

grant update on table "public"."saved_vendors" to "anon";

grant delete on table "public"."saved_vendors" to "authenticated";

grant insert on table "public"."saved_vendors" to "authenticated";

grant references on table "public"."saved_vendors" to "authenticated";

grant select on table "public"."saved_vendors" to "authenticated";

grant trigger on table "public"."saved_vendors" to "authenticated";

grant truncate on table "public"."saved_vendors" to "authenticated";

grant update on table "public"."saved_vendors" to "authenticated";

grant delete on table "public"."saved_vendors" to "prisma";

grant insert on table "public"."saved_vendors" to "prisma";

grant references on table "public"."saved_vendors" to "prisma";

grant select on table "public"."saved_vendors" to "prisma";

grant trigger on table "public"."saved_vendors" to "prisma";

grant truncate on table "public"."saved_vendors" to "prisma";

grant update on table "public"."saved_vendors" to "prisma";

grant delete on table "public"."saved_vendors" to "service_role";

grant insert on table "public"."saved_vendors" to "service_role";

grant references on table "public"."saved_vendors" to "service_role";

grant select on table "public"."saved_vendors" to "service_role";

grant trigger on table "public"."saved_vendors" to "service_role";

grant truncate on table "public"."saved_vendors" to "service_role";

grant update on table "public"."saved_vendors" to "service_role";

grant delete on table "public"."soon_to_wed_albums" to "anon";

grant insert on table "public"."soon_to_wed_albums" to "anon";

grant references on table "public"."soon_to_wed_albums" to "anon";

grant select on table "public"."soon_to_wed_albums" to "anon";

grant trigger on table "public"."soon_to_wed_albums" to "anon";

grant truncate on table "public"."soon_to_wed_albums" to "anon";

grant update on table "public"."soon_to_wed_albums" to "anon";

grant delete on table "public"."soon_to_wed_albums" to "authenticated";

grant insert on table "public"."soon_to_wed_albums" to "authenticated";

grant references on table "public"."soon_to_wed_albums" to "authenticated";

grant select on table "public"."soon_to_wed_albums" to "authenticated";

grant trigger on table "public"."soon_to_wed_albums" to "authenticated";

grant truncate on table "public"."soon_to_wed_albums" to "authenticated";

grant update on table "public"."soon_to_wed_albums" to "authenticated";

grant delete on table "public"."soon_to_wed_albums" to "prisma";

grant insert on table "public"."soon_to_wed_albums" to "prisma";

grant references on table "public"."soon_to_wed_albums" to "prisma";

grant select on table "public"."soon_to_wed_albums" to "prisma";

grant trigger on table "public"."soon_to_wed_albums" to "prisma";

grant truncate on table "public"."soon_to_wed_albums" to "prisma";

grant update on table "public"."soon_to_wed_albums" to "prisma";

grant delete on table "public"."soon_to_wed_albums" to "service_role";

grant insert on table "public"."soon_to_wed_albums" to "service_role";

grant references on table "public"."soon_to_wed_albums" to "service_role";

grant select on table "public"."soon_to_wed_albums" to "service_role";

grant trigger on table "public"."soon_to_wed_albums" to "service_role";

grant truncate on table "public"."soon_to_wed_albums" to "service_role";

grant update on table "public"."soon_to_wed_albums" to "service_role";

grant delete on table "public"."soon_to_wed_profiles" to "anon";

grant insert on table "public"."soon_to_wed_profiles" to "anon";

grant references on table "public"."soon_to_wed_profiles" to "anon";

grant select on table "public"."soon_to_wed_profiles" to "anon";

grant trigger on table "public"."soon_to_wed_profiles" to "anon";

grant truncate on table "public"."soon_to_wed_profiles" to "anon";

grant update on table "public"."soon_to_wed_profiles" to "anon";

grant delete on table "public"."soon_to_wed_profiles" to "authenticated";

grant insert on table "public"."soon_to_wed_profiles" to "authenticated";

grant references on table "public"."soon_to_wed_profiles" to "authenticated";

grant select on table "public"."soon_to_wed_profiles" to "authenticated";

grant trigger on table "public"."soon_to_wed_profiles" to "authenticated";

grant truncate on table "public"."soon_to_wed_profiles" to "authenticated";

grant update on table "public"."soon_to_wed_profiles" to "authenticated";

grant delete on table "public"."soon_to_wed_profiles" to "prisma";

grant insert on table "public"."soon_to_wed_profiles" to "prisma";

grant references on table "public"."soon_to_wed_profiles" to "prisma";

grant select on table "public"."soon_to_wed_profiles" to "prisma";

grant trigger on table "public"."soon_to_wed_profiles" to "prisma";

grant truncate on table "public"."soon_to_wed_profiles" to "prisma";

grant update on table "public"."soon_to_wed_profiles" to "prisma";

grant delete on table "public"."soon_to_wed_profiles" to "service_role";

grant insert on table "public"."soon_to_wed_profiles" to "service_role";

grant references on table "public"."soon_to_wed_profiles" to "service_role";

grant select on table "public"."soon_to_wed_profiles" to "service_role";

grant trigger on table "public"."soon_to_wed_profiles" to "service_role";

grant truncate on table "public"."soon_to_wed_profiles" to "service_role";

grant update on table "public"."soon_to_wed_profiles" to "service_role";

grant delete on table "public"."staging table" to "anon";

grant insert on table "public"."staging table" to "anon";

grant references on table "public"."staging table" to "anon";

grant select on table "public"."staging table" to "anon";

grant trigger on table "public"."staging table" to "anon";

grant truncate on table "public"."staging table" to "anon";

grant update on table "public"."staging table" to "anon";

grant delete on table "public"."staging table" to "authenticated";

grant insert on table "public"."staging table" to "authenticated";

grant references on table "public"."staging table" to "authenticated";

grant select on table "public"."staging table" to "authenticated";

grant trigger on table "public"."staging table" to "authenticated";

grant truncate on table "public"."staging table" to "authenticated";

grant update on table "public"."staging table" to "authenticated";

grant delete on table "public"."staging table" to "prisma";

grant insert on table "public"."staging table" to "prisma";

grant references on table "public"."staging table" to "prisma";

grant select on table "public"."staging table" to "prisma";

grant trigger on table "public"."staging table" to "prisma";

grant truncate on table "public"."staging table" to "prisma";

grant update on table "public"."staging table" to "prisma";

grant delete on table "public"."staging table" to "service_role";

grant insert on table "public"."staging table" to "service_role";

grant references on table "public"."staging table" to "service_role";

grant select on table "public"."staging table" to "service_role";

grant trigger on table "public"."staging table" to "service_role";

grant truncate on table "public"."staging table" to "service_role";

grant update on table "public"."staging table" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "prisma";

grant insert on table "public"."subscriptions" to "prisma";

grant references on table "public"."subscriptions" to "prisma";

grant select on table "public"."subscriptions" to "prisma";

grant trigger on table "public"."subscriptions" to "prisma";

grant truncate on table "public"."subscriptions" to "prisma";

grant update on table "public"."subscriptions" to "prisma";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."superadmin_sessions" to "prisma";

grant insert on table "public"."superadmin_sessions" to "prisma";

grant references on table "public"."superadmin_sessions" to "prisma";

grant select on table "public"."superadmin_sessions" to "prisma";

grant trigger on table "public"."superadmin_sessions" to "prisma";

grant truncate on table "public"."superadmin_sessions" to "prisma";

grant update on table "public"."superadmin_sessions" to "prisma";

grant delete on table "public"."superadmins" to "prisma";

grant insert on table "public"."superadmins" to "prisma";

grant references on table "public"."superadmins" to "prisma";

grant select on table "public"."superadmins" to "prisma";

grant trigger on table "public"."superadmins" to "prisma";

grant truncate on table "public"."superadmins" to "prisma";

grant update on table "public"."superadmins" to "prisma";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "prisma";

grant insert on table "public"."users" to "prisma";

grant references on table "public"."users" to "prisma";

grant select on table "public"."users" to "prisma";

grant trigger on table "public"."users" to "prisma";

grant truncate on table "public"."users" to "prisma";

grant update on table "public"."users" to "prisma";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."vendor_affiliations" to "anon";

grant insert on table "public"."vendor_affiliations" to "anon";

grant references on table "public"."vendor_affiliations" to "anon";

grant select on table "public"."vendor_affiliations" to "anon";

grant trigger on table "public"."vendor_affiliations" to "anon";

grant truncate on table "public"."vendor_affiliations" to "anon";

grant update on table "public"."vendor_affiliations" to "anon";

grant delete on table "public"."vendor_affiliations" to "authenticated";

grant insert on table "public"."vendor_affiliations" to "authenticated";

grant references on table "public"."vendor_affiliations" to "authenticated";

grant select on table "public"."vendor_affiliations" to "authenticated";

grant trigger on table "public"."vendor_affiliations" to "authenticated";

grant truncate on table "public"."vendor_affiliations" to "authenticated";

grant update on table "public"."vendor_affiliations" to "authenticated";

grant delete on table "public"."vendor_affiliations" to "prisma";

grant insert on table "public"."vendor_affiliations" to "prisma";

grant references on table "public"."vendor_affiliations" to "prisma";

grant select on table "public"."vendor_affiliations" to "prisma";

grant trigger on table "public"."vendor_affiliations" to "prisma";

grant truncate on table "public"."vendor_affiliations" to "prisma";

grant update on table "public"."vendor_affiliations" to "prisma";

grant delete on table "public"."vendor_affiliations" to "service_role";

grant insert on table "public"."vendor_affiliations" to "service_role";

grant references on table "public"."vendor_affiliations" to "service_role";

grant select on table "public"."vendor_affiliations" to "service_role";

grant trigger on table "public"."vendor_affiliations" to "service_role";

grant truncate on table "public"."vendor_affiliations" to "service_role";

grant update on table "public"."vendor_affiliations" to "service_role";

grant delete on table "public"."vendor_analytics" to "anon";

grant insert on table "public"."vendor_analytics" to "anon";

grant references on table "public"."vendor_analytics" to "anon";

grant select on table "public"."vendor_analytics" to "anon";

grant trigger on table "public"."vendor_analytics" to "anon";

grant truncate on table "public"."vendor_analytics" to "anon";

grant update on table "public"."vendor_analytics" to "anon";

grant delete on table "public"."vendor_analytics" to "authenticated";

grant insert on table "public"."vendor_analytics" to "authenticated";

grant references on table "public"."vendor_analytics" to "authenticated";

grant select on table "public"."vendor_analytics" to "authenticated";

grant trigger on table "public"."vendor_analytics" to "authenticated";

grant truncate on table "public"."vendor_analytics" to "authenticated";

grant update on table "public"."vendor_analytics" to "authenticated";

grant delete on table "public"."vendor_analytics" to "prisma";

grant insert on table "public"."vendor_analytics" to "prisma";

grant references on table "public"."vendor_analytics" to "prisma";

grant select on table "public"."vendor_analytics" to "prisma";

grant trigger on table "public"."vendor_analytics" to "prisma";

grant truncate on table "public"."vendor_analytics" to "prisma";

grant update on table "public"."vendor_analytics" to "prisma";

grant delete on table "public"."vendor_analytics" to "service_role";

grant insert on table "public"."vendor_analytics" to "service_role";

grant references on table "public"."vendor_analytics" to "service_role";

grant select on table "public"."vendor_analytics" to "service_role";

grant trigger on table "public"."vendor_analytics" to "service_role";

grant truncate on table "public"."vendor_analytics" to "service_role";

grant update on table "public"."vendor_analytics" to "service_role";

grant delete on table "public"."vendor_categories" to "anon";

grant insert on table "public"."vendor_categories" to "anon";

grant references on table "public"."vendor_categories" to "anon";

grant select on table "public"."vendor_categories" to "anon";

grant trigger on table "public"."vendor_categories" to "anon";

grant truncate on table "public"."vendor_categories" to "anon";

grant update on table "public"."vendor_categories" to "anon";

grant delete on table "public"."vendor_categories" to "authenticated";

grant insert on table "public"."vendor_categories" to "authenticated";

grant references on table "public"."vendor_categories" to "authenticated";

grant select on table "public"."vendor_categories" to "authenticated";

grant trigger on table "public"."vendor_categories" to "authenticated";

grant truncate on table "public"."vendor_categories" to "authenticated";

grant update on table "public"."vendor_categories" to "authenticated";

grant delete on table "public"."vendor_categories" to "prisma";

grant insert on table "public"."vendor_categories" to "prisma";

grant references on table "public"."vendor_categories" to "prisma";

grant select on table "public"."vendor_categories" to "prisma";

grant trigger on table "public"."vendor_categories" to "prisma";

grant truncate on table "public"."vendor_categories" to "prisma";

grant update on table "public"."vendor_categories" to "prisma";

grant delete on table "public"."vendor_categories" to "service_role";

grant insert on table "public"."vendor_categories" to "service_role";

grant references on table "public"."vendor_categories" to "service_role";

grant select on table "public"."vendor_categories" to "service_role";

grant trigger on table "public"."vendor_categories" to "service_role";

grant truncate on table "public"."vendor_categories" to "service_role";

grant update on table "public"."vendor_categories" to "service_role";

grant delete on table "public"."vendor_editors" to "prisma";

grant insert on table "public"."vendor_editors" to "prisma";

grant references on table "public"."vendor_editors" to "prisma";

grant select on table "public"."vendor_editors" to "prisma";

grant trigger on table "public"."vendor_editors" to "prisma";

grant truncate on table "public"."vendor_editors" to "prisma";

grant update on table "public"."vendor_editors" to "prisma";

grant delete on table "public"."vendor_editors" to "service_role";

grant insert on table "public"."vendor_editors" to "service_role";

grant references on table "public"."vendor_editors" to "service_role";

grant select on table "public"."vendor_editors" to "service_role";

grant trigger on table "public"."vendor_editors" to "service_role";

grant truncate on table "public"."vendor_editors" to "service_role";

grant update on table "public"."vendor_editors" to "service_role";

grant delete on table "public"."vendor_images" to "anon";

grant insert on table "public"."vendor_images" to "anon";

grant references on table "public"."vendor_images" to "anon";

grant select on table "public"."vendor_images" to "anon";

grant trigger on table "public"."vendor_images" to "anon";

grant truncate on table "public"."vendor_images" to "anon";

grant update on table "public"."vendor_images" to "anon";

grant delete on table "public"."vendor_images" to "authenticated";

grant insert on table "public"."vendor_images" to "authenticated";

grant references on table "public"."vendor_images" to "authenticated";

grant select on table "public"."vendor_images" to "authenticated";

grant trigger on table "public"."vendor_images" to "authenticated";

grant truncate on table "public"."vendor_images" to "authenticated";

grant update on table "public"."vendor_images" to "authenticated";

grant delete on table "public"."vendor_images" to "prisma";

grant insert on table "public"."vendor_images" to "prisma";

grant references on table "public"."vendor_images" to "prisma";

grant select on table "public"."vendor_images" to "prisma";

grant trigger on table "public"."vendor_images" to "prisma";

grant truncate on table "public"."vendor_images" to "prisma";

grant update on table "public"."vendor_images" to "prisma";

grant delete on table "public"."vendor_images" to "service_role";

grant insert on table "public"."vendor_images" to "service_role";

grant references on table "public"."vendor_images" to "service_role";

grant select on table "public"."vendor_images" to "service_role";

grant trigger on table "public"."vendor_images" to "service_role";

grant truncate on table "public"."vendor_images" to "service_role";

grant update on table "public"."vendor_images" to "service_role";

grant delete on table "public"."vendor_registrations" to "anon";

grant insert on table "public"."vendor_registrations" to "anon";

grant references on table "public"."vendor_registrations" to "anon";

grant select on table "public"."vendor_registrations" to "anon";

grant trigger on table "public"."vendor_registrations" to "anon";

grant truncate on table "public"."vendor_registrations" to "anon";

grant update on table "public"."vendor_registrations" to "anon";

grant delete on table "public"."vendor_registrations" to "authenticated";

grant insert on table "public"."vendor_registrations" to "authenticated";

grant references on table "public"."vendor_registrations" to "authenticated";

grant select on table "public"."vendor_registrations" to "authenticated";

grant trigger on table "public"."vendor_registrations" to "authenticated";

grant truncate on table "public"."vendor_registrations" to "authenticated";

grant update on table "public"."vendor_registrations" to "authenticated";

grant delete on table "public"."vendor_registrations" to "prisma";

grant insert on table "public"."vendor_registrations" to "prisma";

grant references on table "public"."vendor_registrations" to "prisma";

grant select on table "public"."vendor_registrations" to "prisma";

grant trigger on table "public"."vendor_registrations" to "prisma";

grant truncate on table "public"."vendor_registrations" to "prisma";

grant update on table "public"."vendor_registrations" to "prisma";

grant delete on table "public"."vendor_registrations" to "service_role";

grant insert on table "public"."vendor_registrations" to "service_role";

grant references on table "public"."vendor_registrations" to "service_role";

grant select on table "public"."vendor_registrations" to "service_role";

grant trigger on table "public"."vendor_registrations" to "service_role";

grant truncate on table "public"."vendor_registrations" to "service_role";

grant update on table "public"."vendor_registrations" to "service_role";

grant delete on table "public"."vendor_social_links" to "anon";

grant insert on table "public"."vendor_social_links" to "anon";

grant references on table "public"."vendor_social_links" to "anon";

grant select on table "public"."vendor_social_links" to "anon";

grant trigger on table "public"."vendor_social_links" to "anon";

grant truncate on table "public"."vendor_social_links" to "anon";

grant update on table "public"."vendor_social_links" to "anon";

grant delete on table "public"."vendor_social_links" to "authenticated";

grant insert on table "public"."vendor_social_links" to "authenticated";

grant references on table "public"."vendor_social_links" to "authenticated";

grant select on table "public"."vendor_social_links" to "authenticated";

grant trigger on table "public"."vendor_social_links" to "authenticated";

grant truncate on table "public"."vendor_social_links" to "authenticated";

grant update on table "public"."vendor_social_links" to "authenticated";

grant delete on table "public"."vendor_social_links" to "prisma";

grant insert on table "public"."vendor_social_links" to "prisma";

grant references on table "public"."vendor_social_links" to "prisma";

grant select on table "public"."vendor_social_links" to "prisma";

grant trigger on table "public"."vendor_social_links" to "prisma";

grant truncate on table "public"."vendor_social_links" to "prisma";

grant update on table "public"."vendor_social_links" to "prisma";

grant delete on table "public"."vendor_social_links" to "service_role";

grant insert on table "public"."vendor_social_links" to "service_role";

grant references on table "public"."vendor_social_links" to "service_role";

grant select on table "public"."vendor_social_links" to "service_role";

grant trigger on table "public"."vendor_social_links" to "service_role";

grant truncate on table "public"."vendor_social_links" to "service_role";

grant update on table "public"."vendor_social_links" to "service_role";

grant delete on table "public"."vendors" to "anon";

grant insert on table "public"."vendors" to "anon";

grant references on table "public"."vendors" to "anon";

grant select on table "public"."vendors" to "anon";

grant trigger on table "public"."vendors" to "anon";

grant truncate on table "public"."vendors" to "anon";

grant update on table "public"."vendors" to "anon";

grant delete on table "public"."vendors" to "authenticated";

grant insert on table "public"."vendors" to "authenticated";

grant references on table "public"."vendors" to "authenticated";

grant select on table "public"."vendors" to "authenticated";

grant trigger on table "public"."vendors" to "authenticated";

grant truncate on table "public"."vendors" to "authenticated";

grant update on table "public"."vendors" to "authenticated";

grant delete on table "public"."vendors" to "prisma";

grant insert on table "public"."vendors" to "prisma";

grant references on table "public"."vendors" to "prisma";

grant select on table "public"."vendors" to "prisma";

grant trigger on table "public"."vendors" to "prisma";

grant truncate on table "public"."vendors" to "prisma";

grant update on table "public"."vendors" to "prisma";

grant delete on table "public"."vendors" to "service_role";

grant insert on table "public"."vendors" to "service_role";

grant references on table "public"."vendors" to "service_role";

grant select on table "public"."vendors" to "service_role";

grant trigger on table "public"."vendors" to "service_role";

grant truncate on table "public"."vendors" to "service_role";

grant update on table "public"."vendors" to "service_role";

grant delete on table "public"."verification_documents" to "anon";

grant insert on table "public"."verification_documents" to "anon";

grant references on table "public"."verification_documents" to "anon";

grant select on table "public"."verification_documents" to "anon";

grant trigger on table "public"."verification_documents" to "anon";

grant truncate on table "public"."verification_documents" to "anon";

grant update on table "public"."verification_documents" to "anon";

grant delete on table "public"."verification_documents" to "authenticated";

grant insert on table "public"."verification_documents" to "authenticated";

grant references on table "public"."verification_documents" to "authenticated";

grant select on table "public"."verification_documents" to "authenticated";

grant trigger on table "public"."verification_documents" to "authenticated";

grant truncate on table "public"."verification_documents" to "authenticated";

grant update on table "public"."verification_documents" to "authenticated";

grant delete on table "public"."verification_documents" to "prisma";

grant insert on table "public"."verification_documents" to "prisma";

grant references on table "public"."verification_documents" to "prisma";

grant select on table "public"."verification_documents" to "prisma";

grant trigger on table "public"."verification_documents" to "prisma";

grant truncate on table "public"."verification_documents" to "prisma";

grant update on table "public"."verification_documents" to "prisma";

grant delete on table "public"."verification_documents" to "service_role";

grant insert on table "public"."verification_documents" to "service_role";

grant references on table "public"."verification_documents" to "service_role";

grant select on table "public"."verification_documents" to "service_role";

grant trigger on table "public"."verification_documents" to "service_role";

grant truncate on table "public"."verification_documents" to "service_role";

grant update on table "public"."verification_documents" to "service_role";


  create policy "Affiliations are editable by admins only"
  on "public"."affiliations"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Affiliations are viewable by everyone"
  on "public"."affiliations"
  as permissive
  for select
  to public
using (true);



  create policy "Photos visible based on album visibility"
  on "public"."album_photos"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.soon_to_wed_albums a
  WHERE ((a.id = album_photos.album_id) AND (((a.visibility)::text = 'public'::text) OR (a.user_id = auth.uid()) OR public.is_admin())))));



  create policy "Users can manage photos in their own albums"
  on "public"."album_photos"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.soon_to_wed_albums a
  WHERE ((a.id = album_photos.album_id) AND (a.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.soon_to_wed_albums a
  WHERE ((a.id = album_photos.album_id) AND (a.user_id = auth.uid())))));



  create policy "Active fairs are viewable by everyone"
  on "public"."bridal_fairs"
  as permissive
  for select
  to public
using (((is_active = true) OR public.is_admin()));



  create policy "Only admins can manage fairs"
  on "public"."bridal_fairs"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Categories are editable by admins only"
  on "public"."categories"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Categories are viewable by everyone"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can view all fair registrations"
  on "public"."fair_registrations"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Anyone can create fair registrations"
  on "public"."fair_registrations"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can view their own fair registrations"
  on "public"."fair_registrations"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "Admins have full access to inquiries"
  on "public"."inquiries"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Authenticated users can create inquiries"
  on "public"."inquiries"
  as permissive
  for insert
  to public
with check (((user_id = auth.uid()) OR (auth.uid() IS NULL)));



  create policy "Users can delete their own inquiries"
  on "public"."inquiries"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Vendors can update inquiry status"
  on "public"."inquiries"
  as permissive
  for update
  to public
using (public.owns_vendor(vendor_id))
with check (public.owns_vendor(vendor_id));



  create policy "Vendors can view inquiries sent to them"
  on "public"."inquiries"
  as permissive
  for select
  to public
using ((public.owns_vendor(vendor_id) OR (user_id = auth.uid()) OR public.is_admin()));



  create policy "Plans are editable by admins only"
  on "public"."plans"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Plans are viewable by everyone"
  on "public"."plans"
  as permissive
  for select
  to public
using (true);



  create policy "Active promos are viewable by everyone"
  on "public"."promos"
  as permissive
  for select
  to public
using (((is_active = true) OR public.owns_vendor(vendor_id) OR public.is_admin()));



  create policy "Admins can manage all promos"
  on "public"."promos"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendor owners can manage their promos"
  on "public"."promos"
  as permissive
  for all
  to public
using (public.owns_vendor(vendor_id))
with check (public.owns_vendor(vendor_id));



  create policy "Regions are editable by admins only"
  on "public"."regions"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Regions are viewable by everyone"
  on "public"."regions"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage all reviews"
  on "public"."reviews"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Authenticated users can create reviews"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check (((user_id = auth.uid()) AND (auth.uid() IS NOT NULL)));



  create policy "Published reviews are viewable by everyone"
  on "public"."reviews"
  as permissive
  for select
  to public
using ((((status)::text = 'published'::text) OR (user_id = auth.uid()) OR public.is_admin()));



  create policy "Users can delete their own reviews"
  on "public"."reviews"
  as permissive
  for delete
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "Users can update their own reviews"
  on "public"."reviews"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can manage their own saved promos"
  on "public"."saved_promos"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view their own saved promos"
  on "public"."saved_promos"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "Users can manage their own saved vendors"
  on "public"."saved_vendors"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view their own saved vendors"
  on "public"."saved_vendors"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "Users can manage their own albums"
  on "public"."soon_to_wed_albums"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view public albums or their own"
  on "public"."soon_to_wed_albums"
  as permissive
  for select
  to public
using ((((visibility)::text = 'public'::text) OR (user_id = auth.uid()) OR public.is_admin()));



  create policy "Admins have full access to profiles"
  on "public"."soon_to_wed_profiles"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Users can manage their own profile"
  on "public"."soon_to_wed_profiles"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view public profiles"
  on "public"."soon_to_wed_profiles"
  as permissive
  for select
  to public
using ((((profile_visibility)::text = 'public'::text) OR (user_id = auth.uid()) OR public.is_admin()));



  create policy "Only admins can manage subscriptions"
  on "public"."subscriptions"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendors can view their own subscriptions"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((public.owns_vendor(vendor_id) OR public.is_admin()));



  create policy "Admins have full access to users"
  on "public"."users"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "New users can insert their own record"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((id = auth.uid()));



  create policy "Users can update their own record"
  on "public"."users"
  as permissive
  for update
  to public
using ((id = auth.uid()))
with check ((id = auth.uid()));



  create policy "Users can view their own record"
  on "public"."users"
  as permissive
  for select
  to public
using (((id = auth.uid()) OR public.is_admin()));



  create policy "Only admins can manage affiliations"
  on "public"."vendor_affiliations"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendor affiliations are viewable by everyone"
  on "public"."vendor_affiliations"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access to analytics"
  on "public"."vendor_analytics"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "System can insert analytics"
  on "public"."vendor_analytics"
  as permissive
  for insert
  to public
with check (true);



  create policy "Vendors can view their own analytics"
  on "public"."vendor_analytics"
  as permissive
  for select
  to public
using ((public.owns_vendor(vendor_id) OR public.is_admin()));



  create policy "Admins can manage all vendor categories"
  on "public"."vendor_categories"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendor categories are viewable by everyone"
  on "public"."vendor_categories"
  as permissive
  for select
  to public
using (true);



  create policy "Vendor owners can manage their categories"
  on "public"."vendor_categories"
  as permissive
  for all
  to public
using (public.owns_vendor(vendor_id))
with check (public.owns_vendor(vendor_id));



  create policy "Admins can manage all vendor images"
  on "public"."vendor_images"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendor images are viewable by everyone"
  on "public"."vendor_images"
  as permissive
  for select
  to public
using (true);



  create policy "Vendor owners can manage their images"
  on "public"."vendor_images"
  as permissive
  for all
  to public
using (public.owns_vendor(vendor_id))
with check (public.owns_vendor(vendor_id));



  create policy "Admins can manage all registrations"
  on "public"."vendor_registrations"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Authenticated users can create registrations"
  on "public"."vendor_registrations"
  as permissive
  for insert
  to public
with check ((submitted_by_user_id = auth.uid()));



  create policy "Users can update their pending registrations"
  on "public"."vendor_registrations"
  as permissive
  for update
  to public
using (((submitted_by_user_id = auth.uid()) AND ((status)::text = 'submitted'::text)))
with check (((submitted_by_user_id = auth.uid()) AND ((status)::text = 'submitted'::text)));



  create policy "Users can view their own registrations"
  on "public"."vendor_registrations"
  as permissive
  for select
  to public
using (((submitted_by_user_id = auth.uid()) OR public.is_admin()));



  create policy "Social links are viewable by everyone"
  on "public"."vendor_social_links"
  as permissive
  for select
  to public
using (true);



  create policy "Vendor owners can manage their social links"
  on "public"."vendor_social_links"
  as permissive
  for all
  to public
using (public.owns_vendor(vendor_id))
with check (public.owns_vendor(vendor_id));



  create policy "Active vendors are viewable by everyone"
  on "public"."vendors"
  as permissive
  for select
  to public
using (((is_active = true) OR (user_id = auth.uid()) OR public.is_admin()));



  create policy "Admins have full access to vendors"
  on "public"."vendors"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Suppliers can create their own vendor listing"
  on "public"."vendors"
  as permissive
  for insert
  to public
with check (((user_id = auth.uid()) AND public.is_supplier()));



  create policy "Suppliers can delete their own vendor"
  on "public"."vendors"
  as permissive
  for delete
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "Suppliers can update their own vendor"
  on "public"."vendors"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Admins can manage all verification documents"
  on "public"."verification_documents"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "Vendors can delete their own documents"
  on "public"."verification_documents"
  as permissive
  for delete
  to public
using ((public.owns_vendor(vendor_id) OR (EXISTS ( SELECT 1
   FROM public.vendor_registrations vr
  WHERE ((vr.id = verification_documents.registration_id) AND (vr.submitted_by_user_id = auth.uid()))))));



  create policy "Vendors can upload their own documents"
  on "public"."verification_documents"
  as permissive
  for insert
  to public
with check ((public.owns_vendor(vendor_id) OR (EXISTS ( SELECT 1
   FROM public.vendor_registrations vr
  WHERE ((vr.id = verification_documents.registration_id) AND (vr.submitted_by_user_id = auth.uid()))))));



  create policy "Vendors can view their own documents"
  on "public"."verification_documents"
  as permissive
  for select
  to public
using ((public.owns_vendor(vendor_id) OR (EXISTS ( SELECT 1
   FROM public.vendor_registrations vr
  WHERE ((vr.id = verification_documents.registration_id) AND (vr.submitted_by_user_id = auth.uid())))) OR public.is_admin()));


CREATE TRIGGER update_fairs_updated_at BEFORE UPDATE ON public.bridal_fairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promos_updated_at BEFORE UPDATE ON public.promos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stw_profiles_updated_at BEFORE UPDATE ON public.soon_to_wed_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_superadmins_updated_at BEFORE UPDATE ON public.superadmins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.vendor_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Public vendor images are viewable by everyone"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'vendor-images'::text));



  create policy "Vendors can upload their own documents"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'verification-docs'::text) AND public.owns_vendor(((storage.foldername(name))[1])::integer)));



  create policy "Vendors can upload to their own folder"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'vendor-images'::text) AND public.owns_vendor(((storage.foldername(name))[1])::integer)));



  create policy "Vendors can view their own documents"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'verification-docs'::text) AND (public.owns_vendor(((storage.foldername(name))[1])::integer) OR public.is_admin())));



