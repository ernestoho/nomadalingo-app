import { useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Button, FieldError, Typography } from 'heroui-native';
import { router, Stack } from 'expo-router';

import { deleteAccount } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function DeleteAccountScreen() {
  const { language } = useI18n();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const remove = async () => {
    setPending(true);
    setError('');
    try {
      await deleteAccount();
      router.replace('/(auth)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la cuenta.');
    } finally {
      setPending(false);
    }
  };

  const confirmRemove = () => {
    const title = language === 'es' ? '¿Eliminar tu cuenta?' : 'Delete your account?';
    const message =
      language === 'es'
        ? 'Esta acción es permanente y no se puede deshacer.'
        : 'This action is permanent and cannot be undone.';

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) void remove();
      return;
    }

    Alert.alert(title, message, [
      { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
      {
        text: language === 'es' ? 'Eliminar' : 'Delete',
        style: 'destructive',
        onPress: () => void remove(),
      },
    ]);
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
      <Button className="bg-danger" isDisabled={pending} onPress={confirmRemove}>
        <Button.Label>
          {pending ? '…' : language === 'es' ? 'Eliminar permanentemente' : 'Delete permanently'}
        </Button.Label>
      </Button>
    </ScrollView>
  );
}
