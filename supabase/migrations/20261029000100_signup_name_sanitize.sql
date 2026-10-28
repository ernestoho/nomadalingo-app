-- Keep the content filter from ever breaking sign-up.
--
-- public.handle_new_user() copies the name supplied by the identity provider
-- (Apple sends `full_name`) straight into profiles.display_name. Now that
-- display_name is CHECK-constrained by public.has_blocked_terms(), a provider
-- name that happens to match a blocked term would abort the insert and make
-- the whole sign-up fail. Fall back to an empty name instead: the person can
-- pick their own on the onboarding screen, where the app explains why.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provided text;
begin
  provided := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    ''
  );

  if public.has_blocked_terms(provided) then
    provided := '';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, provided)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
