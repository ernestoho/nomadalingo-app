import { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { View } from 'react-native';

import { StateView } from '@/components/StateView';
import { completeOAuthSession } from '@/lib/social-auth';

export default function OAuthCallbackScreen() {
  const handled = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    void Linking.getInitialURL()
      .then(async (url) => {
        if (!url) throw new Error('No se encontró la respuesta de inicio de sesión.');
        await completeOAuthSession(url);
        router.replace('/');
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesión.');
      });
  }, []);

  return (
    <View className="bg-background flex-1 items-center justify-center p-6">
      <StateView
        loading={!error}
        message={error || 'Completando inicio de sesión…'}
        actionLabel={error ? 'Volver' : undefined}
        onAction={error ? () => router.replace('/(auth)') : undefined}
      />
    </View>
  );
}
