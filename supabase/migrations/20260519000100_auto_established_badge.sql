-- Create trigger function to manage established_professional status automatically
CREATE OR REPLACE FUNCTION public.update_vendor_established_status()
RETURNS trigger AS $$
DECLARE
  current_year integer;
  established_year integer;
  is_10_years boolean;
  statuses text[];
  new_statuses text[];
  s text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  
  IF NEW.year_established IS NOT NULL THEN
    established_year := EXTRACT(YEAR FROM NEW.year_established)::integer;
    is_10_years := (current_year - established_year) >= 10;
  ELSE
    is_10_years := false;
  END IF;

  -- Parse current document_verified
  IF NEW.document_verified IS NOT NULL AND NEW.document_verified <> '' THEN
    SELECT array_agg(trim(val)) INTO statuses
    FROM unnest(string_to_array(NEW.document_verified, ',')) val;
  ELSE
    statuses := ARRAY[]::text[];
  END IF;

  -- Filter out existing 'established_professional' and empty items
  new_statuses := ARRAY[]::text[];
  IF statuses IS NOT NULL THEN
    FOREACH s IN ARRAY statuses LOOP
      IF s <> 'established_professional' AND s <> '' AND s IS NOT NULL THEN
        new_statuses := array_append(new_statuses, s);
      END IF;
    END LOOP;
  END IF;

  -- Append 'established_professional' if vendor is at least 10 years old
  IF is_10_years THEN
    new_statuses := array_append(new_statuses, 'established_professional');
  END IF;

  -- Serialize back to NEW.document_verified
  IF array_length(new_statuses, 1) IS NULL THEN
    NEW.document_verified := NULL;
  ELSE
    NEW.document_verified := array_to_string(new_statuses, ',');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to public.vendors
DROP TRIGGER IF EXISTS trg_vendors_established_status ON public.vendors;

CREATE TRIGGER trg_vendors_established_status
BEFORE INSERT OR UPDATE OF year_established, document_verified
ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_vendor_established_status();

-- Force initial update to sync all existing vendors
UPDATE public.vendors SET updated_at = now();

-- Update search_vendors RPC to return document_verified
DROP FUNCTION IF EXISTS public.search_vendors(text,text,text,text,text,integer,text,integer,integer);

CREATE OR REPLACE FUNCTION public.search_vendors(
  p_q text default null,
  p_category_slug text default null,
  p_affiliation_slug text default null,
  p_theme_slug text default null,
  p_location text default null,
  p_region_id integer default null,
  p_sort text default 'rating',
  p_from integer default 0,
  p_to integer default 59
)
returns table (
  id integer,
  business_name text,
  slug text,
  logo_url text,
  average_rating numeric,
  review_count integer,
  location_text text,
  city text,
  cover_focus_x numeric,
  cover_focus_y numeric,
  cover_zoom numeric,
  plan jsonb,
  save_count integer,
  view_count integer,
  updated_at timestamptz,
  cover_image_url text,
  document_verified text,
  total_count bigint
)
language sql
stable
as $$
  with input as (
    select
      nullif(trim(p_q), '') as q,
      nullif(trim(p_category_slug), '') as category_slug,
      nullif(trim(p_affiliation_slug), '') as affiliation_slug,
      nullif(trim(p_theme_slug), '') as theme_slug,
      nullif(trim(p_location), '') as location,
      p_region_id as region_id,
      coalesce(nullif(trim(p_sort), ''), 'rating') as sort_key,
      greatest(coalesce(p_from, 0), 0) as from_i,
      greatest(coalesce(p_to, 0), 0) as to_i
  ),
  filtered as (
    select
      v.id,
      v.business_name,
      v.slug,
      v.logo_url,
      v.average_rating,
      v.review_count,
      v.location_text,
      v.city,
      v.cover_focus_x,
      v.cover_focus_y,
      v.cover_zoom,
      jsonb_build_object('id', p.id, 'name', p.name) as plan,
      v.save_count,
      v.view_count,
      v.updated_at,
      ci.image_url as cover_image_url,
      v.document_verified,
      count(*) over() as total_count,
      (select from_i from input) as from_i,
      (select to_i from input) as to_i,
      (select sort_key from input) as sort_key
    from vendors v
    left join plans p on p.id = v.plan_id
    left join lateral (
      select vi.image_url
      from vendor_images vi
      where vi.vendor_id = v.id
      order by vi.is_cover desc, vi.display_order asc
      limit 1
    ) ci on true
    cross join input i
    where v.is_active = true
      and (i.q is null or v.business_name ilike ('%' || i.q || '%'))
      and (
        i.location is null
        or v.city ilike ('%' || replace(regexp_replace(i.location, '[%_<>''"&]', '', 'g'), ' ', '%') || '%')
        or v.location_text ilike ('%' || replace(regexp_replace(i.location, '[%_<>''"&]', '', 'g'), ' ', '%') || '%')
        or v.address ilike ('%' || replace(regexp_replace(i.location, '[%_<>''"&]', '', 'g'), ' ', '%') || '%')
      )
      and (i.region_id is null or v.region_id = i.region_id)
      and (
        i.category_slug is null
        or exists (
          select 1
          from vendor_categories vc
          join categories c on c.id = vc.category_id
          where vc.vendor_id = v.id
            and c.slug = i.category_slug
        )
      )
      and (
        i.affiliation_slug is null
        or exists (
          select 1
          from vendor_affiliations va
          join affiliations a on a.id = va.affiliation_id
          where va.vendor_id = v.id
            and a.slug = i.affiliation_slug
        )
      )
      and (
        i.theme_slug is null
        or exists (
          select 1
          from vendor_themes vt
          join themes t on t.id = vt.theme_id
          where vt.vendor_id = v.id
            and t.slug = i.theme_slug
        )
      )
  )
  select
    filtered.id,
    filtered.business_name,
    filtered.slug,
    filtered.logo_url,
    filtered.average_rating,
    filtered.review_count,
    filtered.location_text,
    filtered.city,
    filtered.cover_focus_x,
    filtered.cover_focus_y,
    filtered.cover_zoom,
    filtered.plan,
    filtered.save_count,
    filtered.view_count,
    filtered.updated_at,
    filtered.cover_image_url,
    filtered.document_verified,
    filtered.total_count
  from filtered
  order by
    case when filtered.sort_key = 'alpha' then filtered.business_name end asc nulls last,
    case when filtered.sort_key = 'newest' then filtered.updated_at end desc nulls last,
    case when filtered.sort_key = 'newest' then filtered.id end desc nulls last,
    case when filtered.sort_key = 'saves' then filtered.save_count end desc nulls last,
    case when filtered.sort_key = 'views' then filtered.view_count end desc nulls last,
    case when filtered.sort_key = 'rating' then filtered.average_rating end desc nulls last,
    case when filtered.sort_key = 'rating' then filtered.review_count end desc nulls last,
    filtered.business_name asc,
    filtered.id asc
  offset (select from_i from input)
  limit (select greatest((to_i - from_i + 1), 0) from input);
$$;
