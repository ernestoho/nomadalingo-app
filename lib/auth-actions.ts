import { supabase } from '@/lib/backend';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requestEmailCode(email: string) {
  return supabase.auth.signInWithOtp({ email: normalizeEmail(email) });
}

export async function verifyEmailCode(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token: token.trim(),
    type: 'email',
  });
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
