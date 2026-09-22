import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { bilt } from '@/lib/backend';

WebBrowser.maybeCompleteAuthSession();

const OAUTH_CALLBACK = 'auth/callback';

function oauthRedirectUrl() {
  return Linking.createURL(OAUTH_CALLBACK, { scheme: 'nomadalingo' });
}

function getCallbackParameters(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const fragment = url.split('#')[1] ?? '';
  const parameters = new URLSearchParams(fragment || query);
  const errorDescription = parameters.get('error_description') ?? parameters.get('error');

  if (errorDescription) throw new Error(errorDescription);
  return parameters;
}

export async function completeOAuthSession(url: string) {
  const parameters = getCallbackParameters(url);
  const code = parameters.get('code');

  if (code) {
    const { error } = await bilt.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return;
  }

  const accessToken = parameters.get('access_token');
  const refreshToken = parameters.get('refresh_token');
  if (!accessToken || !refreshToken) throw new Error('No se pudo completar el inicio de sesión.');

  const { error } = await bilt.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(error.message);
}

async function startBrowserProvider(provider: 'google') {
  const redirectTo = oauthRedirectUrl();
  const { data, error } = await bilt.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) throw new Error(error.message);
  if (!data.url) throw new Error('No se pudo abrir el inicio de sesión.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  await completeOAuthSession(result.url);
  return true;
}

export async function signInWithGoogle() {
  if (Platform.OS === 'web')
    throw new Error('Google está disponible en la app para iOS y Android.');
  return startBrowserProvider('google');
}

export async function signInWithApple() {
  if (Platform.OS !== 'ios' || !(await AppleAuthentication.isAvailableAsync())) {
    throw new Error('Apple está disponible en dispositivos iOS compatibles.');
  }

  const nonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);

  try {
    const credential = await AppleAuthentication.signInAsync({
      nonce: hashedNonce,
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) throw new Error('Apple no devolvió una identidad válida.');

    const { error } = await bilt.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ERR_REQUEST_CANCELED'
    ) {
      return false;
    }
    throw error;
  }
}
