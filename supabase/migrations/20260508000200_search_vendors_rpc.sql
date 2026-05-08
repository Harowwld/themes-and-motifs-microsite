-- Create a single-query vendor search RPC to avoid N+1 lookups and large IN clauses

create or replace function public.search_vendors(
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
    id,
    business_name,
    slug,
    logo_url,
    average_rating,
    review_count,
    location_text,
    city,
    cover_focus_x,
    cover_focus_y,
    cover_zoom,
    plan,
    save_count,
    view_count,
    updated_at,
    cover_image_url,
    total_count
  from filtered
  order by
    case when sort_key = 'alpha' then business_name end asc nulls last,
    case when sort_key = 'newest' then updated_at end desc nulls last,
    case when sort_key = 'newest' then id end desc nulls last,
    case when sort_key = 'saves' then save_count end desc nulls last,
    case when sort_key = 'views' then view_count end desc nulls last,
    case when sort_key = 'rating' then average_rating end desc nulls last,
    case when sort_key = 'rating' then review_count end desc nulls last,
    business_name asc,
    id asc
  offset (select from_i from input)
  limit (select greatest((to_i - from_i + 1), 0) from input);
$$;
