import { useState } from 'react';
import { View } from 'react-native';
import { FieldError } from 'heroui-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ban, Flag, MessageCircle, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy } from '@/components/Coastal';
import { ConfirmAction } from '@/components/ConfirmAction';
import { ProfileSummary } from '@/components/ProfileSummary';
import { RouteHeader } from '@/components/RouteHeader';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useMvpActions, usePeople } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function PersonScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  return <PersonDetail key={id} id={id} />;
}

function PersonDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const { data = [], isLoading, error, refetch } = usePeople(user?.id);
  useRefreshOnFocus(refetch);
  const { requestChat, blockUser, reportUser } = useMvpActions();
  const profile = data.find((item) => item.id === id);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirm, setConfirm] = useState<'block' | 'report' | null>(null);
  const pending = requestChat.isPending || blockUser.isPending || reportUser.isPending;
  const act = async (kind: 'chat' | 'block' | 'report') => {
    if (!user) return;
    setActionError('');
    setSuccess('');
    try {
      if (kind === 'chat') await requestChat.mutateAsync(id);
      else if (kind === 'block') await blockUser.mutateAsync(id);
      else
        await reportUser.mutateAsync({
          reporter_id: user.id,
          reported_user_id: id,
          reason: 'other',
          details: es ? 'Reporte enviado desde el perfil.' : 'Report sent from the profile.',
        });
      setConfirm(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (kind === 'block') router.replace('/(tabs)/people');
      else
        setSuccess(
          kind === 'chat'
            ? es
              ? 'Solicitud enviada.'
              : 'Request sent.'
            : es
              ? 'Reporte enviado.'
              : 'Report sent.',
        );
    } catch (caught) {
      setConfirm(null);
      setActionError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo completar la acción.'
            : 'Could not complete this action.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  return (
    <AppScreen topInset={false}>
      <RouteHeader
        title={es ? 'Perfil' : 'Profile'}
        fallback="/(tabs)/people"
        fallbackLabel={es ? 'Ver personas' : 'Browse people'}
      />
      {isLoading || error || !profile ? (
        <StateView
          icon={Users}
          loading={isLoading}
          error={Boolean(error)}
          message={error?.message || (es ? 'Perfil no disponible.' : 'Profile unavailable.')}
          actionLabel={
            error ? (es ? 'Reintentar' : 'Retry') : es ? 'Ver personas' : 'Browse people'
          }
          onAction={() => (error ? void refetch() : router.replace('/(tabs)/people'))}
        />
      ) : (
        <>
          <ProfileSummary profile={profile} language={language} />
          {actionError ? <FieldError>{actionError}</FieldError> : null}
          {success ? (
            <Copy bold style={{ textAlign: 'center' }}>
              {success}
            </Copy>
          ) : null}
          <Action
            icon={MessageCircle}
            disabled={pending || requestChat.isSuccess}
            label={
              requestChat.isPending
                ? es
                  ? 'Enviando…'
                  : 'Sending…'
                : requestChat.isSuccess
                  ? es
                    ? 'Solicitud enviada'
                    : 'Request sent'
                  : es
                    ? 'Pedir conversación'
                    : 'Request a chat'
            }
            onPress={() => void act('chat')}
          />
          <View style={{ gap: 8 }}>
            <Action
              ghost
              icon={Flag}
              disabled={pending || !user}
              label={es ? 'Reportar perfil' : 'Report profile'}
              onPress={() => setConfirm('report')}
            />
            <Action
              ghost
              icon={Ban}
              disabled={pending}
              label={es ? 'Bloquear persona' : 'Block person'}
              onPress={() => setConfirm('block')}
            />
          </View>
          <ConfirmAction
            open={Boolean(confirm)}
            onClose={() => setConfirm(null)}
            pending={pending}
            title={
              confirm === 'block'
                ? es
                  ? '¿Bloquear a esta persona?'
                  : 'Block this person?'
                : es
                  ? '¿Reportar este perfil?'
                  : 'Report this profile?'
            }
            message={
              confirm === 'block'
                ? es
                  ? 'Se bloqueará a esta persona.'
                  : 'This person will be blocked.'
                : es
                  ? 'Se enviará un reporte de este perfil para revisión.'
                  : 'This profile will be reported for review.'
            }
            confirmLabel={
              pending
                ? es
                  ? 'Procesando…'
                  : 'Processing…'
                : confirm === 'block'
                  ? es
                    ? 'Bloquear'
                    : 'Block'
                  : es
                    ? 'Reportar'
                    : 'Report'
            }
            cancelLabel={es ? 'Cancelar' : 'Cancel'}
            onConfirm={() => {
              if (confirm) void act(confirm);
            }}
          />
        </>
      )}
    </AppScreen>
  );
}
