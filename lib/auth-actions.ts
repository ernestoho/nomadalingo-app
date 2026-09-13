import { supabase } from '@/lib/supabase';

export async function signUpWithPassword(email: string, password: string, displayName: string) {
  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
}

export async function verifySignupCode(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'signup',
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
}

export async function verifyRecoveryCode(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'recovery',
  });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke<{ deleted: boolean }>('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  if (!data?.deleted) throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
  await supabase.auth.signOut({ scope: 'local' });
}
