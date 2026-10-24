-- Hardening pass driven by the Supabase security advisors.
--
-- 1. `touch_updated_at` had a mutable search_path (advisor 0011).
-- 2. Every function in `public` is exposed at /rest/v1/rpc once the caller has
--    EXECUTE. Trigger functions and internal predicates should never be
--    callable over HTTP, so revoke them (advisor 0029).
--
-- The app-facing RPCs deliberately stay executable by `authenticated`; they are
-- guarded internally by auth.uid() checks.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Trigger functions: invoked by the system, never over the API.
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.guard_profile_role() from public, anon, authenticated;
revoke execute on function public.sync_rsvp_count() from public, anon, authenticated;
revoke execute on function public.touch_conversation_last_message() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Predicates only referenced from SECURITY DEFINER functions (which run as the
-- owner) or from no policy at all. The client never calls these directly.
revoke execute on function public.is_onboarded(uuid) from public, anon, authenticated;
revoke execute on function public.profiles_are_blocked(uuid) from public, anon, authenticated;
revoke execute on function public.is_conversation_participant(uuid) from public, anon, authenticated;
