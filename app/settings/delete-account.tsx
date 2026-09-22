import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, FieldError, Typography } from 'heroui-native';
import { router, Stack } from 'expo-router';

import { bilt } from '@/lib/backend';
import { useI18n } from '@/lib/i18n';

export default function DeleteAccountScreen() {
  const { language } = useI18n();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const remove = async () => {
    setPending(true);
    setError('');
    const { error: fnError } = await bilt.functions.invoke('delete-account', { body: {} });
    if (fnError) {
      setError(fnError.message);
      setPending(false);
      return;
    }
    await bilt.auth.signOut();
    router.replace('/(auth)');
  };
  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-5 p-safe-offset-5">
      <Stack.Screen
        options={{
          headerShown: true,
          title: language === 'es' ? 'Eliminar cuenta' : 'Delete account',
        }}
      />
      <Typography.Heading type="h2">
        {language === 'es' ? 'Eliminar tu cuenta' : 'Delete your account'}
      </Typography.Heading>
      <Typography.Paragraph color="muted">
        {language === 'es'
          ? 'Esta acción elimina permanentemente tu perfil, reservas, conversaciones y mensajes. No se puede deshacer.'
          : 'This permanently deletes your profile, RSVPs, conversations, and messages. It cannot be undone.'}
      </Typography.Paragraph>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button className="bg-danger" isDisabled={pending} onPress={() => void remove()}>
        <Button.Label>
          {pending ? '…' : language === 'es' ? 'Eliminar permanentemente' : 'Delete permanently'}
        </Button.Label>
      </Button>
    </ScrollView>
  );
}
