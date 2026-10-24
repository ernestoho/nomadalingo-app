-- Performance pass driven by the Supabase performance advisor.
--
-- 1. auth_rls_initplan: `auth.uid()` and `is_admin()` were called once per row.
--    Wrapping them in a scalar subquery turns them into an InitPlan that
--    Postgres evaluates a single time per query.
-- 2. multiple_permissive_policies: `events_admin_write` (FOR ALL) overlapped
--    with `events_select` on SELECT. Split it per action.
-- 3. unindexed_foreign_keys: add covering indexes for the six uncovered FKs.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or public.can_view_profile(id)
  );

drop policy profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'member');

drop policy profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

drop policy events_select on public.events;
create policy events_select on public.events
  for select to authenticated
  using (
    published
    or (select public.is_admin())
    or created_by = (select auth.uid())
  );

drop policy events_admin_write on public.events;

create policy events_admin_insert on public.events
  for insert to authenticated
  with check ((select public.is_admin()));

create policy events_admin_update on public.events
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy events_admin_delete on public.events
  for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- event_rsvps
-- ---------------------------------------------------------------------------

drop policy event_rsvps_select on public.event_rsvps;
create policy event_rsvps_select on public.event_rsvps
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- chat_requests
-- ---------------------------------------------------------------------------

drop policy chat_requests_select on public.chat_requests;
create policy chat_requests_select on public.chat_requests
  for select to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

drop policy conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (
    public.is_conversation_member(id, (select auth.uid()))
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

drop policy messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (
    public.is_conversation_member(conversation_id, (select auth.uid()))
    or (select public.is_admin())
  );

drop policy messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.can_send_message(conversation_id)
  );

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------

drop policy blocks_select on public.blocks;
create policy blocks_select on public.blocks
  for select to authenticated
  using (
    blocker_id = (select auth.uid())
    or blocked_id = (select auth.uid())
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------

drop policy reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and (
      (reported_user_id is not null and reported_user_id <> (select auth.uid()))
      or (message_id is not null and public.can_report_message(message_id, reported_user_id))
    )
  );

drop policy reports_select on public.reports;
create policy reports_select on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Covering indexes for unindexed foreign keys
-- ---------------------------------------------------------------------------

create index if not exists conversations_accepted_request_id_idx
  on public.conversations (accepted_request_id);
create index if not exists events_created_by_idx
  on public.events (created_by);
create index if not exists messages_sender_id_idx
  on public.messages (sender_id);
create index if not exists reports_message_id_idx
  on public.reports (message_id);
create index if not exists reports_reported_user_id_idx
  on public.reports (reported_user_id);
create index if not exists reports_reviewed_by_idx
  on public.reports (reviewed_by);
