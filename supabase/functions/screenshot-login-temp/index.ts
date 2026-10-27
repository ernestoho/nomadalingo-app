// TEMPORARY helper: mints an email OTP for throwaway demo accounts so the
// App Store screenshot pipeline can sign in without an inbox.
//
// Hard-scoped to the reserved @nomadalingo.invalid domain, which cannot receive
// mail. It is NOT part of the shipped product: deploy it only for a capture
// cycle, then delete it from the Supabase dashboard (or replace its body with a
// stub that returns 410) so it cannot keep minting codes.
//
// Deploy with:  npx supabase functions deploy screenshot-login-temp --no-verify-jwt
//
// The deployed copy is currently disabled (it answers 410 Gone). Redeploy this
// file to run another capture cycle.
//
// Note: generateLink() creates the account when the address does not exist yet,
// so every probe leaves a stray member behind. Delete those accounts after a
// capture cycle.

import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_SUFFIX = '@nomadalingo.invalid';

Deno.serve(async (req) => {
  const email = (new URL(req.url).searchParams.get('email') ?? '').trim().toLowerCase();
  if (!email.endsWith(ALLOWED_SUFFIX)) {
    return Response.json({ error: 'not_allowed' }, { status: 403 });
  }
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const otp = (data as any)?.properties?.email_otp;
  if (!otp) return Response.json({ error: 'no_otp_in_response' }, { status: 500 });
  return Response.json({ otp });
});
