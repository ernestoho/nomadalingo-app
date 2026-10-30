-- Demo accounts answer message requests automatically.
--
-- NómadaLingo opens a conversation only when the recipient accepts, which is
-- the right behaviour for real members but leaves an App Review tester stuck:
-- the six seeded profiles never log in, so a request sent to them would sit
-- pending forever and the chat flow could not be exercised (Guideline 2.1).
--
-- This trigger accepts requests addressed to those six accounts and posts one
-- welcome message, so a reviewer who sends a request immediately gets a real
-- conversation. Only the seeded demo ids are affected; requests between real
-- members still go through the normal pending -> accepted flow.

create or replace function public.auto_accept_demo_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  demo_ids uuid[] := array[
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666'
  ]::uuid[];
  low_id uuid;
  high_id uuid;
  conv_id uuid;
begin
  if new.status <> 'pending' or not (new.recipient_id = any(demo_ids)) then
    return new;
  end if;

  update public.chat_requests
     set status = 'accepted', resolved_at = now()
   where id = new.id and status = 'pending';

  low_id := least(new.sender_id, new.recipient_id);
  high_id := greatest(new.sender_id, new.recipient_id);

  select id into conv_id
    from public.conversations
   where participant_low_id = low_id and participant_high_id = high_id;

  if conv_id is null then
    insert into public.conversations (
      participant_low_id, participant_high_id, accepted_request_id, last_message_at
    )
    values (low_id, high_id, new.id, now())
    returning id into conv_id;
  else
    update public.conversations set last_message_at = now() where id = conv_id;
  end if;

  insert into public.messages (conversation_id, sender_id, client_id, body)
  values (
    conv_id,
    new.recipient_id,
    'demo-welcome-' || new.id,
    '¡Hola! Gracias por escribir. Cuéntame qué idioma quieres practicar y te presento al grupo. / Hi! Thanks for reaching out — tell me which language you are practising.'
  )
  on conflict (conversation_id, client_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.auto_accept_demo_request() from public, anon, authenticated;

drop trigger if exists chat_requests_auto_accept_demo on public.chat_requests;
create trigger chat_requests_auto_accept_demo
  after insert on public.chat_requests
  for each row execute function public.auto_accept_demo_request();
