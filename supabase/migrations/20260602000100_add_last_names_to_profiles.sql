-- Add last name columns to soon_to_wed_profiles
ALTER TABLE public.soon_to_wed_profiles
ADD COLUMN groom_last_name character varying,
ADD COLUMN bride_last_name character varying;

-- Update handle_new_user function to copy registration metadata into soon_to_wed_profiles
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

  -- Only create soon-to-wed profile if metadata contains couple-specific registration fields
  if (new.raw_user_meta_data->>'bride_nickname' is not null or new.raw_user_meta_data->>'groom_nickname' is not null) then
    insert into public.soon_to_wed_profiles (
      user_id,
      bride_nickname,
      bride_last_name,
      groom_nickname,
      groom_last_name,
      wedding_date,
      wedding_date_public,
      wedding_venue_area,
      wedding_venue_public,
      location,
      profile_visibility
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'bride_nickname', ''),
      coalesce(new.raw_user_meta_data->>'bride_last_name', ''),
      coalesce(new.raw_user_meta_data->>'groom_nickname', ''),
      coalesce(new.raw_user_meta_data->>'groom_last_name', ''),
      nullif(new.raw_user_meta_data->>'wedding_date', '')::date,
      coalesce((new.raw_user_meta_data->>'wedding_date_public')::boolean, false),
      nullif(new.raw_user_meta_data->>'wedding_venue_area', ''),
      coalesce((new.raw_user_meta_data->>'wedding_venue_public')::boolean, false),
      coalesce(new.raw_user_meta_data->>'location', ''),
      coalesce(new.raw_user_meta_data->>'profile_visibility', 'private')
    ) on conflict (user_id) do update set
      bride_nickname = excluded.bride_nickname,
      bride_last_name = excluded.bride_last_name,
      groom_nickname = excluded.groom_nickname,
      groom_last_name = excluded.groom_last_name,
      wedding_date = excluded.wedding_date,
      wedding_date_public = excluded.wedding_date_public,
      wedding_venue_area = excluded.wedding_venue_area,
      wedding_venue_public = excluded.wedding_venue_public,
      location = excluded.location,
      profile_visibility = excluded.profile_visibility;
  end if;

  return new;
end;
$function$;
