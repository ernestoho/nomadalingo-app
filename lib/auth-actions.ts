import { supabase } from '@/lib/backend';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requestEmailCode(email: string) {
  return supabase.auth.signInWithOtp({ email: normalizeEmail(email) });
}

/**
 * True when a request never made it to Supabase, as opposed to the server
 * rejecting it. Only transport failures are worth repeating: a request that
 * was rejected, or that succeeded, must never be sent again because the
 * one-time code is consumed either way.
 */
function isTransportError(error: { message?: string; status?: number } | null | undefined) {
  if (!error) return false;
  if (typeof error.status === 'number' && error.status >= 400) return false;
  return /network request failed|failed to fetch|fetch failed|timed out|socket/i.test(
    error.message ?? '',
  );
}

const VERIFY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 800;

/**
 * Verifies an emailed one-time code, repeating the request when the connection
 * drops in transit. Mobile networks drop short requests often enough that a
 * single attempt makes the sign-in screen feel broken; a code that failed in
 * transit is still unused, so a repeat is safe.
 */
export async function verifyEmailCode(email: string, token: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedToken = token.trim();

  for (let attempt = 0; ; attempt += 1) {
    const isLastAttempt = attempt === VERIFY_ATTEMPTS - 1;
    try {
      const result = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: normalizedToken,
        type: 'email',
      });
      if (isLastAttempt || !isTransportError(result.error)) return result;
    } catch (caught) {
      // supabase-js throws instead of returning for some transport failures.
      if (isLastAttempt || !isTransportError(caught as { message?: string })) throw caught;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * (attempt + 1)));
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke<{ deleted: boolean }>('delete-account', {
    body: {},
  });
  if (error) throw error;
  if (!data?.deleted) throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
  const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
  if (signOutError) throw new Error(signOutError.message);
}
