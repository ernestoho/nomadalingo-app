import { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from 'heroui-native';
import { useSegments } from 'expo-router';
import { Download, X } from 'lucide-react-native';
import { Copy, UI } from '@/components/Coastal';
import { useI18n } from '@/lib/i18n';
import * as Haptics from 'expo-haptics';

/**
 * Install affordance for the PWA, web only:
 * - Android/Chrome: captures `beforeinstallprompt` and shows an "Install" button
 *   that triggers the native install prompt.
 * - iOS/Safari: no programmatic prompt exists, so shows a one-time
 *   "Share → Add to Home Screen" hint (dismissal persisted).
 *
 * Hidden when already installed (standalone display mode) and inside iframes
 * (the Bilt live preview embeds the app in one).
 */

// Chrome's install event — not yet in lib.dom.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const IOS_HINT_DISMISSED_KEY = 'pwa-ios-install-hint-dismissed';

function isEligibleBrowserContext(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  // Already installed / running standalone (navigator.standalone is iOS-only).
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Reflect.get(navigator, 'standalone') === true;
  if (standalone) return false;
  // Embedded (e.g. the Bilt live preview iframe) — installing isn't possible there.
  if (window.self !== window.top) return false;
  return true;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ masquerades as macOS but is touch-capable.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIos && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

const TAB_BAR_HEIGHT = 49;

export function InstallPrompt() {
  const { language } = useI18n();
  const es = language === 'es';
  const segments = useSegments();
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + TAB_BAR_HEIGHT + 12;

  useEffect(() => {
    if (!isEligibleBrowserContext()) return undefined;

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const handleAppInstalled = () => {
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!isEligibleBrowserContext() || !isIosSafari()) return;

    void (async () => {
      try {
        const dismissed = await AsyncStorage.getItem(IOS_HINT_DISMISSED_KEY);
        if (!dismissed) {
          setShowIosHint(true);
        }
      } catch (_error) {
        // no-op on storage errors
      }
    })();
  }, []);

  const handleInstall = useCallback(() => {
    if (!installEvent || installing) return;
    void (async () => {
      setInstalling(true);
      setInstallError('');
      try {
        await installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
      } catch {
        setInstallError(es ? 'No se pudo abrir la instalación.' : 'Could not open installation.');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setInstalling(false);
      }
    })();
  }, [installEvent, installing, es]);

  const dismissIosHint = useCallback(() => {
    setShowIosHint(false);
    AsyncStorage.setItem(IOS_HINT_DISMISSED_KEY, 'true').catch(() => {});
  }, []);

  if (
    Platform.OS !== 'web' ||
    segments[0] !== '(tabs)' ||
    (segments[1] && segments[1] !== 'profile')
  )
    return null;
  if (!installEvent && !showIosHint) return null;
  return (
    <View
      style={{
        position: 'absolute',
        bottom,
        alignSelf: 'center',
        width: '90%',
        maxWidth: 560,
        backgroundColor: UI.ink,
        borderRadius: 24,
        padding: 20,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Download size={22} color={UI.tealLight} />
        <Copy light bold style={{ flex: 1 }}>
          {es ? 'NómadaLingo, a un toque' : 'NómadaLingo, one tap away'}
        </Copy>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          accessibilityLabel={es ? 'Cerrar' : 'Dismiss'}
          isDisabled={installing}
          onPress={() => (installEvent ? setInstallEvent(null) : dismissIosHint())}
        >
          <X size={20} color={UI.onDark} />
        </Button>
      </View>
      <Copy light muted size={13}>
        {installEvent
          ? es
            ? 'Añade la app a tu pantalla de inicio.'
            : 'Add the app to your home screen.'
          : es
            ? 'Toca Compartir y luego “Añadir a pantalla de inicio”.'
            : 'Tap Share, then “Add to Home Screen”.'}
      </Copy>
      {installError ? <Copy light>{installError}</Copy> : null}
      {installEvent ? (
        <Button variant="secondary" isDisabled={installing} onPress={handleInstall}>
          <Button.Label>
            {installing ? (es ? 'Abriendo…' : 'Opening…') : es ? 'Instalar app' : 'Install app'}
          </Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
