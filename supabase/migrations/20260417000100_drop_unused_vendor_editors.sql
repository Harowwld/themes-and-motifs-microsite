-- Drop unused vendor_editors table (redundant with editors table)
-- The editors table is used in the codebase and has additional permission fields

drop table if exists public.vendor_editors;
