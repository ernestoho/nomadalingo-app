import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

const backendUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const backendKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Names of the backend values that are not present in this build.
 * Exported so the root layout can explain the problem instead of crashing.
 */
export const missingBackendEnvVars = [
  !backendUrl && 'EXPO_PUBLIC_SUPABASE_URL',
  !backendKey && 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
].filter((name): name is string => Boolean(name));

export const isBackendConfigured = missingBackendEnvVars.length === 0;

// createClient throws immediately when the URL or key is missing, which would
// crash the app during import (white screen, no error visible). Fall back to an
// inert placeholder so the app can boot and render BackendConfigRequired
// instead. Requests to the placeholder host fail, but nothing crashes.
const FALLBACK_URL = 'https://backend-not-configured.invalid';
const FALLBACK_KEY = 'backend-not-configured';

export const supabase = createClient<Database>(
  backendUrl ?? FALLBACK_URL,
  backendKey ?? FALLBACK_KEY,
  {
    auth: {
      storage: {
        getItem: (key) => AsyncStorage.getItem(key),
        setItem: (key, value) => AsyncStorage.setItem(key, value),
        removeItem: (key) => AsyncStorage.removeItem(key),
      },
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);
