import { bilt } from '@/lib/backend';

export async function signUpWithPassword(email: string, password: string, displayName: string) {
  return bilt.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
}

export async function verifySignupCode(email: string, token: string) {
  return bilt.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'signup',
  });
}

export async function signInWithPassword(email: string, password: string) {
  return bilt.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function requestPasswordReset(email: string) {
  return bilt.auth.resetPasswordForEmail(email.trim().toLowerCase());
}

export async function verifyRecoveryCode(email: string, token: string) {
  return bilt.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'recovery',
  });
}

export async function updatePassword(password: string) {
  return bilt.auth.updateUser({ password });
}

export async function signOut() {
  return bilt.auth.signOut();
}

export async function deleteAccount() {
  const { data, error } = await bilt.functions.invoke<{ deleted: boolean }>('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  if (!data?.deleted) throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
  await bilt.auth.signOut({ scope: 'local' });
}
