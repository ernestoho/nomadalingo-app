import { bilt } from '@/lib/backend';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requestEmailCode(email: string) {
  return bilt.auth.signInWithOtp({ email: normalizeEmail(email) });
}

export async function verifyEmailCode(email: string, token: string) {
  return bilt.auth.verifyOtp({
    email: normalizeEmail(email),
    token: token.trim(),
    type: 'email',
  });
}

export async function signOut() {
  return bilt.auth.signOut();
}

export async function deleteAccount() {
  const { data, error } = await bilt.functions.invoke<{ deleted: boolean }>('delete-account', {
    body: {},
  });
  if (error) throw error;
  if (!data?.deleted) throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
  const { error: signOutError } = await bilt.auth.signOut({ scope: 'local' });
  if (signOutError) throw new Error(signOutError.message);
}
