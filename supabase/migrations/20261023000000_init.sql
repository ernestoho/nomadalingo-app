-- NómadaLingo — initial schema
--
-- Recreates the backend the app already expects:
--   8 tables, 5 enums, row-level security, triggers, and the 13 RPCs used by
--   lib/data/mvp.ts.
--
-- Apply with the Supabase SQL editor, `supabase db push`, or the Supabase MCP
-- `apply_migration` tool.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.chat_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.language_level as enum ('beginner', 'intermediate', 'advanced');
create type public.profile_role as enum ('member', 'admin');
create type public.report_reason as enum (
  'harassment', 'spam', 'hate', 'sexual_content', 'impersonation', 'other'
);
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  spoken_languages text[] not null default '{}',
  learning_languages text[] not null default '{}',
  learning_level public.language_level not null default 'beginner',
  bio text not null default '' check (char_length(bio) <= 600),
  adult_confirmed_at timestamptz,
  onboarding_completed_at timestamptz,
  role public.profile_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title_es text not null check (char_length(title_es) between 1 and 120),
  title_en text not null check (char_length(title_en) between 1 and 120),
  description_es text not null default '' check (char_length(description_es) <= 4000),
  description_en text not null default '' check (char_length(description_en) <= 4000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_name text not null default '' check (char_length(location_name) <= 160),
  area text not null default '' check (char_length(area) <= 120),
  capacity integer not null default 20 check (capacity > 0),
  rsvp_count integer not null default 0 check (rsvp_count >= 0),
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_order check (ends_at >= starts_at)
);

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.chat_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  status public.chat_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint chat_requests_not_self check (sender_id <> recipient_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_low_id uuid not null references public.profiles (id) on delete cascade,
  participant_high_id uuid not null references public.profiles (id) on delete cascade,
  accepted_request_id uuid not null references public.chat_requests (id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  constraint conversations_ordered check (participant_low_id < participant_high_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 100),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  reason public.report_reason not null,
  details text not null default '' check (char_length(details) <= 2000),
  status public.report_status not null default 'open',
  admin_notes text not null default '' check (char_length(admin_notes) <= 2000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_present check (reported_user_id is not null or message_id is not null)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index events_published_starts_at_idx on public.events (published, starts_at);
create index event_rsvps_user_idx on public.event_rsvps (user_id);
create index chat_requests_sender_idx on public.chat_requests (sender_id, created_at desc);
create index chat_requests_recipient_idx on public.chat_requests (recipient_id, created_at desc);
create unique index chat_requests_pending_pair_idx
  on public.chat_requests (sender_id, recipient_id)
  where status = 'pending';
create unique index conversations_pair_idx
  on public.conversations (participant_low_id, participant_high_id);
create index conversations_low_idx on public.conversations (participant_low_id, last_message_at desc);
create index conversations_high_idx on public.conversations (participant_high_id, last_message_at desc);
create unique index messages_client_id_idx on public.messages (conversation_id, client_id);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index blocks_blocked_idx on public.blocks (blocked_id);
create index reports_reporter_idx on public.reports (reporter_id, created_at desc);
create index reports_status_idx on public.reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer avoids RLS recursion)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_onboarded(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = user_id and p.onboarding_completed_at is not null
  );
$$;

create or replace function public.profiles_are_blocked(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = other_user_id)
       or (b.blocker_id = other_user_id and b.blocked_id = auth.uid())
  );
$$;

create or replace function public.can_view_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and target_user_id is not null
     and not public.profiles_are_blocked(target_user_id);
$$;

create or replace function public.is_conversation_member(
  check_conversation_id uuid,
  check_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = check_conversation_id
      and (c.participant_low_id = check_user_id or c.participant_high_id = check_user_id)
  );
$$;

create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_conversation_member(target_conversation_id, auth.uid());
$$;

create or replace function public.can_send_message(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = target_conversation_id
      and (c.participant_low_id = auth.uid() or c.participant_high_id = auth.uid())
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id =
          case when c.participant_low_id = auth.uid()
               then c.participant_high_id else c.participant_low_id end)
           or (b.blocked_id = auth.uid() and b.blocker_id =
          case when c.participant_low_id = auth.uid()
               then c.participant_high_id else c.participant_low_id end)
      )
  );
$$;

create or replace function public.can_report_message(target_message_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = target_message_id
      and (c.participant_low_id = auth.uid() or c.participant_high_id = auth.uid())
      and (target_user_id is null or m.sender_id = target_user_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.chat_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- profiles -----------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.can_view_profile(id));

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and role = 'member');

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- events -------------------------------------------------------------------
create policy events_select on public.events
  for select to authenticated
  using (published or public.is_admin() or created_by = auth.uid());

create policy events_admin_write on public.events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- event_rsvps --------------------------------------------------------------
create policy event_rsvps_select on public.event_rsvps
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- chat_requests ------------------------------------------------------------
create policy chat_requests_select on public.chat_requests
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());

-- conversations ------------------------------------------------------------
create policy conversations_select on public.conversations
  for select to authenticated
  using (public.is_conversation_member(id, auth.uid()) or public.is_admin());

-- messages -----------------------------------------------------------------
create policy messages_select on public.messages
  for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()) or public.is_admin());

create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_send_message(conversation_id)
  );

-- blocks -------------------------------------------------------------------
create policy blocks_select on public.blocks
  for select to authenticated
  using (blocker_id = auth.uid() or blocked_id = auth.uid() or public.is_admin());

-- reports ------------------------------------------------------------------
create policy reports_insert on public.reports
  for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and (
      (reported_user_id is not null and (
        reported_user_id <> auth.uid()
        and not public.profiles_are_blocked(reported_user_id)
      ))
      or (message_id is not null and public.can_report_message(message_id, reported_user_id))
    )
  );

create policy reports_select on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

-- Users may never grant themselves the admin role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Keep rsvp_count accurate regardless of how rows change.
create or replace function public.sync_rsvp_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event uuid := coalesce(new.event_id, old.event_id);
begin
  update public.events e
     set rsvp_count = (select count(*) from public.event_rsvps r where r.event_id = target_event)
   where e.id = target_event;
  return null;
end;
$$;

create trigger event_rsvps_sync_count
  after insert or delete on public.event_rsvps
  for each row execute function public.sync_rsvp_count();

-- Bump the conversation ordering key when a message lands.
create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_last_message();

-- Every auth user gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''),
             nullif(new.raw_user_meta_data ->> 'name', ''),
             '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPCs used by the app
-- ---------------------------------------------------------------------------

create or replace function public.create_chat_request(target_recipient_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing uuid;
  created uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if target_recipient_id = auth.uid() then
    raise exception 'cannot_message_self' using errcode = '22023';
  end if;
  if public.profiles_are_blocked(target_recipient_id) then
    raise exception 'blocked' using errcode = '42501';
  end if;
  if not public.is_onboarded(target_recipient_id) then
    raise exception 'recipient_unavailable' using errcode = '22023';
  end if;

  select id into existing
    from public.chat_requests
   where sender_id = auth.uid()
     and recipient_id = target_recipient_id
     and status = 'pending'
   limit 1;

  if existing is not null then
    return existing;
  end if;

  insert into public.chat_requests (sender_id, recipient_id)
  values (auth.uid(), target_recipient_id)
  returning id into created;

  return created;
end;
$$;

create or replace function public.accept_chat_request(target_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.chat_requests;
  low_id uuid;
  high_id uuid;
  conversation_id uuid;
begin
  select * into request_row
    from public.chat_requests
   where id = target_request_id
   for update;

  if request_row.id is null then
    raise exception 'request_not_found' using errcode = '22023';
  end if;
  if request_row.recipient_id <> auth.uid() then
    raise exception 'not_recipient' using errcode = '42501';
  end if;
  if request_row.status <> 'pending' then
    raise exception 'request_not_pending' using errcode = '22023';
  end if;

  update public.chat_requests
     set status = 'accepted', resolved_at = now()
   where id = target_request_id;

  low_id := least(request_row.sender_id, request_row.recipient_id);
  high_id := greatest(request_row.sender_id, request_row.recipient_id);

  select id into conversation_id
    from public.conversations
   where participant_low_id = low_id and participant_high_id = high_id;

  if conversation_id is null then
    insert into public.conversations (participant_low_id, participant_high_id, accepted_request_id)
    values (low_id, high_id, target_request_id)
    returning id into conversation_id;
  end if;

  return conversation_id;
end;
$$;

create or replace function public.decline_chat_request(target_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_requests
     set status = 'declined', resolved_at = now()
   where id = target_request_id
     and recipient_id = auth.uid()
     and status = 'pending';

  if not found then
    raise exception 'request_not_found' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.cancel_chat_request(target_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_requests
     set status = 'cancelled', resolved_at = now()
   where id = target_request_id
     and sender_id = auth.uid()
     and status = 'pending';

  if not found then
    raise exception 'request_not_found' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.start_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  low_id uuid;
  high_id uuid;
  conversation_id uuid;
  request_id uuid;
begin
  if other_user_id = auth.uid() then
    raise exception 'cannot_message_self' using errcode = '22023';
  end if;
  if public.profiles_are_blocked(other_user_id) then
    raise exception 'blocked' using errcode = '42501';
  end if;

  low_id := least(auth.uid(), other_user_id);
  high_id := greatest(auth.uid(), other_user_id);

  select id into conversation_id
    from public.conversations
   where participant_low_id = low_id and participant_high_id = high_id;

  if conversation_id is not null then
    return conversation_id;
  end if;

  insert into public.chat_requests (sender_id, recipient_id, status, resolved_at)
  values (auth.uid(), other_user_id, 'accepted', now())
  returning id into request_id;

  insert into public.conversations (participant_low_id, participant_high_id, accepted_request_id)
  values (low_id, high_id, request_id)
  returning id into conversation_id;

  return conversation_id;
end;
$$;

create or replace function public.join_event(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row public.events;
  current_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into event_row from public.events where id = target_event_id for update;

  if event_row.id is null or not event_row.published then
    raise exception 'event_not_found' using errcode = '22023';
  end if;
  if event_row.ends_at < now() then
    raise exception 'event_finished' using errcode = '22023';
  end if;

  select count(*) into current_count from public.event_rsvps where event_id = target_event_id;

  if not exists (
    select 1 from public.event_rsvps
     where event_id = target_event_id and user_id = auth.uid()
  ) and current_count >= event_row.capacity then
    raise exception 'event_full' using errcode = '22023';
  end if;

  insert into public.event_rsvps (event_id, user_id)
  values (target_event_id, auth.uid())
  on conflict do nothing;
end;
$$;

create or replace function public.cancel_event_rsvp(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.event_rsvps
   where event_id = target_event_id and user_id = auth.uid();
end;
$$;

create or replace function public.block_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id = auth.uid() then
    raise exception 'cannot_block_self' using errcode = '22023';
  end if;

  insert into public.blocks (blocker_id, blocked_id)
  values (auth.uid(), target_user_id)
  on conflict do nothing;

  -- Blocking closes any pending request in either direction.
  update public.chat_requests
     set status = 'cancelled', resolved_at = now()
   where status = 'pending'
     and ((sender_id = auth.uid() and recipient_id = target_user_id)
       or (sender_id = target_user_id and recipient_id = auth.uid()));
end;
$$;

create or replace function public.unblock_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.blocks
   where blocker_id = auth.uid() and blocked_id = target_user_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Function grants
-- ---------------------------------------------------------------------------

grant execute on function public.create_chat_request(uuid) to authenticated;
grant execute on function public.accept_chat_request(uuid) to authenticated;
grant execute on function public.decline_chat_request(uuid) to authenticated;
grant execute on function public.cancel_chat_request(uuid) to authenticated;
grant execute on function public.start_direct_conversation(uuid) to authenticated;
grant execute on function public.join_event(uuid) to authenticated;
grant execute on function public.cancel_event_rsvp(uuid) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;
grant execute on function public.can_send_message(uuid) to authenticated;
grant execute on function public.can_report_message(uuid, uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_onboarded(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;
grant execute on function public.is_conversation_participant(uuid) to authenticated;
grant execute on function public.profiles_are_blocked(uuid) to authenticated;
