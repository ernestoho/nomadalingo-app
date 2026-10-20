// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { KaushanScript_400Regular } from '@expo-google-fonts/kaushan-script';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as DevClient from 'expo-dev-client';
import { HeroUINativeProvider } from 'heroui-native';
import { Uniwind } from 'uniwind';
import {
  ErrorBoundary as ExpoErrorBoundary,
  type ErrorBoundaryProps,
  SplashScreen,
  Stack,
  useSegments,
} from 'expo-router';

import { AuthRouteGuard } from '@/components/AuthRouteGuard';
import { AuthProvider } from '@/lib/auth';
import { DataProvider } from '@/lib/data-provider';
import { I18nProvider } from '@/lib/i18n';
import { initPostHog } from '@/lib/posthog';
import { registerServiceWorker } from '@/lib/registerServiceWorker';
import { reportErrorToParent } from '@/lib/reportPreviewError';
import { InstallPrompt } from '@/components/InstallPrompt';

/**
 * Custom ErrorBoundary that reports React render errors to the parent window (Bilt preview iframe)
 * and then renders the default Expo error UI.
 */
function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (Platform.OS === 'web' && error) {
      const message = [error.message, error.stack].filter(Boolean).join('\n');
      reportErrorToParent(message);
    }
  }, [error]);
  return <ExpoErrorBoundary error={error} retry={retry} />;
}

export { ErrorBoundary };

// Starter is light-only by default. Remove this when implementing requested dark mode.
Uniwind.setTheme('light');

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const isLaunchRoute = !segments[0];
  const [loaded, error] = useFonts({
    KaushanScript_400Regular,
    BricolageGrotesque_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Report uncaught JS errors and unhandled promise rejections to parent (Bilt preview iframe)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const handleError = (event: ErrorEvent) => {
      const message = event.error?.stack ?? event.message ?? 'Unknown error';
      reportErrorToParent(message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const message =
        err instanceof Error ? [err.message, err.stack].filter(Boolean).join('\n') : String(err);
      reportErrorToParent(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Inject Google Fonts link tag for web to ensure fonts load through proxy
  // Also register font family names as fallback if expo-font fails
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if link already exists
      const existingLink = document.querySelector(
        'link[href*="fonts.googleapis.com/css2?family=Bricolage"]',
      );

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }

      // The stylesheet link mirrors the bundled NómadaLingo font families on web.
    }
  }, []);

  useEffect(() => {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (__DEV__ && Platform.OS !== 'web' && !isExpoGo) {
      const timer = setTimeout(() => {
        DevClient.closeMenu();
        DevClient.hideMenu();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initPostHog();
    }
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DataProvider>
        <AuthProvider>
          <I18nProvider>
            <HeroUINativeProvider>
              <AuthRouteGuard>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="event/[id]" />
                  <Stack.Screen name="person/[id]" />
                  <Stack.Screen name="chat/[id]" />
                  <Stack.Screen name="settings/index" />
                </Stack>
              </AuthRouteGuard>
              {!isLaunchRoute && <InstallPrompt />}
            </HeroUINativeProvider>
          </I18nProvider>
        </AuthProvider>
      </DataProvider>
    </GestureHandlerRootView>
  );
}
