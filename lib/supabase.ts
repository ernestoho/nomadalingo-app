// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { createClient, processLock, type SupportedStorage } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  );
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL must use HTTPS.');
}

const SECURE_STORE_CHUNK_SIZE = 1800;
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const nativeAuthStorage: SupportedStorage = {
  async getItem(key) {
    const chunkCountValue = await SecureStore.getItemAsync(`${key}.count`);
    if (!chunkCountValue) return SecureStore.getItemAsync(key);

    const chunkCount = Number.parseInt(chunkCountValue, 10);
    if (!Number.isSafeInteger(chunkCount) || chunkCount < 1) return null;

    const chunks = await Promise.all(
      Array.from({ length: chunkCount }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`)),
    );
    return chunks.every((chunk) => chunk !== null) ? chunks.join('') : null;
  },
  async setItem(key, value) {
    await this.removeItem(key);
    const chunks = Array.from(
      { length: Math.ceil(value.length / SECURE_STORE_CHUNK_SIZE) },
      (_, index) =>
        value.slice(index * SECURE_STORE_CHUNK_SIZE, (index + 1) * SECURE_STORE_CHUNK_SIZE),
    );
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}.${index}`, chunk, secureStoreOptions),
      ),
    );
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length), secureStoreOptions);
  },
  async removeItem(key) {
    const chunkCountValue = await SecureStore.getItemAsync(`${key}.count`);
    const chunkCount = chunkCountValue ? Number.parseInt(chunkCountValue, 10) : 0;
    if (Number.isSafeInteger(chunkCount) && chunkCount > 0) {
      await Promise.all(
        Array.from({ length: chunkCount }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.${index}`),
        ),
      );
    }
    await Promise.all([
      SecureStore.deleteItemAsync(`${key}.count`),
      SecureStore.deleteItemAsync(key),
    ]);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS === 'web' ? {} : { storage: nativeAuthStorage }),
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
    persistSession: true,
    lock: processLock,
  },
  global: {
    headers: {
      'X-Client-Info': 'nomadalingo-expo',
    },
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
