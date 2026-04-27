-- Grant usage on inquiries_id_seq to allow inserts from anon and authenticated users
grant usage on sequence "public"."inquiries_id_seq" to anon;
grant usage on sequence "public"."inquiries_id_seq" to authenticated;
grant usage on sequence "public"."inquiries_id_seq" to service_role;
