import { useState } from 'react';
import { FieldError } from 'heroui-native';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, UI } from '@/components/Coastal';
import { ConfirmAction } from '@/components/ConfirmAction';
import { RouteHeader } from '@/components/RouteHeader';
import { goBackOrReplace } from '@/lib/navigation';
import { deleteAccount } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function DeleteAccountScreen() {
  const { language } = useI18n();
  const es = language === 'es';
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const remove = async () => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await deleteAccount();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)');
    } catch (caught) {
      setOpen(false);
      setError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo eliminar la cuenta.'
            : 'Could not delete your account.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  };
  return (
    <AppScreen topInset={false}>
      <RouteHeader
        title={es ? 'Eliminar cuenta' : 'Delete account'}
        fallback="/settings"
        fallbackLabel={es ? 'Configuración' : 'Settings'}
      />
      <Trash2 size={44} color={UI.danger} strokeWidth={1.7} />
      <Heading size={36}>{es ? 'Eliminar\ntu cuenta' : 'Delete\nyour account'}</Heading>
      <Copy muted size={16}>
        {es
          ? 'Esta acción elimina permanentemente tu perfil, reservas, conversaciones y mensajes. No se puede deshacer.'
          : 'This permanently deletes your profile, RSVPs, conversations, and messages. It cannot be undone.'}
      </Copy>
      {error ? <FieldError>{error}</FieldError> : null}
      <Action
        secondary
        label={es ? 'Conservar mi cuenta' : 'Keep my account'}
        disabled={pending}
        onPress={() => goBackOrReplace('/settings')}
      />
      <Action
        danger
        label={
          pending
            ? es
              ? 'Eliminando…'
              : 'Deleting…'
            : es
              ? 'Eliminar permanentemente'
              : 'Delete permanently'
        }
        disabled={pending}
        onPress={() => setOpen(true)}
      />
      <ConfirmAction
        open={open}
        onClose={() => setOpen(false)}
        title={es ? '¿Eliminar tu cuenta?' : 'Delete your account?'}
        message={
          es
            ? 'Esta acción es permanente y no se puede deshacer.'
            : 'This action is permanent and cannot be undone.'
        }
        confirmLabel={
          pending ? (es ? 'Eliminando…' : 'Deleting…') : es ? 'Eliminar cuenta' : 'Delete account'
        }
        cancelLabel={es ? 'Cancelar' : 'Cancel'}
        pending={pending}
        onConfirm={() => void remove()}
      />
    </AppScreen>
  );
}
