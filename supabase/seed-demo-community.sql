-- Demo community for App Review.
--
-- An empty social app reads as "incomplete" to a reviewer (Guideline 2.1 /
-- 4.2), so the store build ships with a small, realistic community: six
-- members with bios and languages, two accepted conversations and their
-- messages, alongside the events already seeded.
--
-- These accounts have no password and no working mailbox; they exist as
-- content, not as logins. Safe to re-run: every insert is idempotent.

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'ana.torres@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Torres"}', now(), now()),

  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'marco.ruiz@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marco Ruiz"}', now(), now()),

  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lena.fischer@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lena Fischer"}', now(), now()),

  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'diego.salas@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Salas"}', now(), now()),

  ('55555555-5555-4555-8555-555555555555', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'sofia.mendez@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sofía Méndez"}', now(), now()),

  ('66666666-6666-4666-8666-666666666666', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'tom.becker@demo.nomadalingo.com', '',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tom Becker"}', now(), now())
on conflict (id) do nothing;

update public.profiles set
  display_name = 'Ana Torres',
  bio = 'Diseñadora UX viviendo en Punta Cana. Café por la mañana, mar por la tarde. Busco gente para practicar portugués.',
  spoken_languages = array['Spanish', 'English'],
  learning_languages = array['Portuguese'],
  learning_level = 'intermediate',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '11111111-1111-4111-8111-111111111111';

update public.profiles set
  display_name = 'Marco Ruiz',
  bio = 'Dev backend, tres años trabajando desde distintos países. Organizo sesiones de coworking en Bávaro los martes.',
  spoken_languages = array['Spanish', 'English'],
  learning_languages = array['German'],
  learning_level = 'beginner',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '22222222-2222-4222-8222-222222222222';

update public.profiles set
  display_name = 'Lena Fischer',
  bio = 'De Berlín a Punta Cana. Surf al amanecer, código después. Siempre abierta a un intercambio de idiomas.',
  spoken_languages = array['German', 'English'],
  learning_languages = array['Spanish'],
  learning_level = 'intermediate',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '33333333-3333-4333-8333-333333333333';

update public.profiles set
  display_name = 'Diego Salas',
  bio = 'Fotógrafo y viajero lento. Aprendiendo inglés sin vergüenza: si te animas, practicamos un rato.',
  spoken_languages = array['Spanish'],
  learning_languages = array['English'],
  learning_level = 'beginner',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '44444444-4444-4444-8444-444444444444';

update public.profiles set
  display_name = 'Sofía Méndez',
  bio = 'Profesora de yoga y nómada desde 2021. Doy clases al aire libre en la playa los sábados.',
  spoken_languages = array['Spanish', 'English', 'French'],
  learning_languages = array['Italian'],
  learning_level = 'beginner',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '55555555-5555-4555-8555-555555555555';

update public.profiles set
  display_name = 'Tom Becker',
  bio = 'Canadian in the Caribbean. Learning Spanish one coffee at a time. Happy to help anyone with English.',
  spoken_languages = array['English'],
  learning_languages = array['Spanish'],
  learning_level = 'beginner',
  adult_confirmed_at = now(),
  onboarding_completed_at = now()
where id = '66666666-6666-4666-8666-666666666666';

insert into public.chat_requests (id, sender_id, recipient_id, status, created_at, resolved_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111',
   '22222222-2222-4222-8222-222222222222', 'accepted', now() - interval '3 days', now() - interval '3 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '33333333-3333-4333-8333-333333333333',
   '55555555-5555-4555-8555-555555555555', 'accepted', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.conversations (id, participant_low_id, participant_high_id, accepted_request_id, last_message_at, created_at)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   least('11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid),
   greatest('11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid),
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', now() - interval '3 hours', now() - interval '3 days'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   least('33333333-3333-4333-8333-333333333333'::uuid, '55555555-5555-4555-8555-555555555555'::uuid),
   greatest('33333333-3333-4333-8333-333333333333'::uuid, '55555555-5555-4555-8555-555555555555'::uuid),
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', now() - interval '1 day', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.messages (id, conversation_id, sender_id, client_id, body, created_at)
values
  ('e0000000-0000-4000-8000-000000000001', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   '11111111-1111-4111-8111-111111111111', 'seed-ana-1',
   '¡Hola Marco! Vi que organizas coworking en Bávaro, ¿sigue en pie el de esta semana?',
   now() - interval '3 days' + interval '10 minutes'),

  ('e0000000-0000-4000-8000-000000000002', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   '22222222-2222-4222-8222-222222222222', 'seed-marco-1',
   '¡Hola Ana! Sí, martes a las 10 en el café de la plaza. Trae portátil y ganas de café.',
   now() - interval '3 days' + interval '25 minutes'),

  ('e0000000-0000-4000-8000-000000000003', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   '11111111-1111-4111-8111-111111111111', 'seed-ana-2',
   'Perfecto, ahí estaré. ¿Suele ir mucha gente?',
   now() - interval '2 days'),

  ('e0000000-0000-4000-8000-000000000004', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   '22222222-2222-4222-8222-222222222222', 'seed-marco-2',
   'Somos entre cuatro y seis, bastante tranquilo para trabajar. Nos vemos el martes.',
   now() - interval '3 hours'),

  ('e0000000-0000-4000-8000-000000000005', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   '33333333-3333-4333-8333-333333333333', 'seed-lena-1',
   'Hola Sofía, vi tu clase de yoga en la playa. ¿Puedo sumarme el sábado?',
   now() - interval '2 days' + interval '5 minutes'),

  ('e0000000-0000-4000-8000-000000000006', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   '55555555-5555-4555-8555-555555555555', 'seed-sofia-1',
   '¡Claro que sí! Sábado a las 7, frente al faro. Lleva agua y una toalla.',
   now() - interval '2 days' + interval '40 minutes'),

  ('e0000000-0000-4000-8000-000000000007', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   '33333333-3333-4333-8333-333333333333', 'seed-lena-2',
   'Genial, nos vemos el sábado. ¡Gracias!',
   now() - interval '1 day')
on conflict (id) do nothing;

commit;
