-- Community guidelines filter (App Store Review Guideline 1.2).
--
-- Apple requires apps with user-generated content to provide "a method for
-- filtering objectionable material from being posted". Enforcing it in the
-- database means a modified client cannot bypass it, and the app turns the
-- resulting constraint violation into a friendly message.

create or replace function public.has_blocked_terms(input text)
returns boolean
language plpgsql
immutable
as $$
declare
  blocked text[] := array[
    -- English
    'asshole', 'bitch', 'cunt', 'faggot', 'fuck', 'fucking', 'nigga', 'nigger',
    'retard', 'shit',
    -- Spanish
    'cabron', 'cabrón', 'chupapija', 'culero', 'culiao', 'gonorrea', 'hijoputa',
    'hijueputa', 'malparido', 'maricon', 'maricón', 'mierda', 'pendeja',
    'pendejo', 'puta', 'puto', 'verga', 'zorra'
  ];
  term text;
begin
  if input is null then
    return false;
  end if;
  foreach term in array blocked loop
    if input ~* ('\m' || term || '\M') then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

comment on function public.has_blocked_terms(text) is
  'True when the text contains a blocked term. Backs the CHECK constraints on user-authored text.';

grant execute on function public.has_blocked_terms(text) to anon, authenticated;

alter table public.profiles
  add constraint profiles_display_name_clean check (not public.has_blocked_terms(display_name)),
  add constraint profiles_bio_clean check (not public.has_blocked_terms(bio));

alter table public.messages
  add constraint messages_body_clean check (not public.has_blocked_terms(body));
