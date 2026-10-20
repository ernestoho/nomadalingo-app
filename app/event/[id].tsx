import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { FieldError } from 'heroui-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CalendarDays, Check, Clock, MapPin, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, UI, layout } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useEvents, useMyRsvps, useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function EventDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const eventQuery = useEvents();
  const rsvpQuery = useMyRsvps(user?.id);
  const { joinEvent, cancelRsvp } = useMvpActions();
  const [actionError, setActionError] = useState('');
  const { refetch: refetchEvents } = eventQuery;
  const { refetch: refetchRsvps } = rsvpQuery;
  const refresh = useCallback(
    () => Promise.all([refetchEvents(), refetchRsvps()]),
    [refetchEvents, refetchRsvps],
  );
  useRefreshOnFocus(refresh);
  const event = eventQuery.data?.find((item) => item.id === id);
  const isGoing = rsvpQuery.data?.some((item) => item.event_id === id);
  const loading = eventQuery.isLoading || rsvpQuery.isLoading;
  const error = eventQuery.error || rsvpQuery.error;
  const isPending = joinEvent.isPending || cancelRsvp.isPending;
  const act = async () => {
    setActionError('');
    try {
      if (isGoing) await cancelRsvp.mutateAsync(id);
      else await joinEvent.mutateAsync(id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo actualizar tu reserva.'
            : 'Could not update your RSVP.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  const date = event ? new Date(event.starts_at) : null;
  return (
    <View style={layout.screen}>
      <AppScreen topInset={false}>
        <RouteHeader
          title={es ? 'Encuentro' : 'Meetup'}
          fallback="/(tabs)/events"
          fallbackLabel={es ? 'Todos los eventos' : 'All events'}
        />
        {loading || error || !event ? (
          <StateView
            loading={loading}
            error={Boolean(error)}
            icon={CalendarDays}
            message={error?.message || (es ? 'Evento no encontrado.' : 'Event not found.')}
            actionLabel={
              error ? (es ? 'Reintentar' : 'Retry') : es ? 'Ver eventos' : 'Browse events'
            }
            onAction={() => (error ? void refresh() : router.replace('/(tabs)/events'))}
          />
        ) : (
          <>
            <View style={{ backgroundColor: UI.ink, borderRadius: 30, padding: 26, gap: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View
                  style={{
                    backgroundColor: UI.tealLight,
                    padding: 14,
                    minWidth: 74,
                    borderRadius: 18,
                    alignItems: 'center',
                  }}
                >
                  <Heading size={32}>{date?.getDate()}</Heading>
                  <Copy bold size={13}>
                    {date?.toLocaleDateString(es ? 'es-DO' : 'en-US', { month: 'short' })}
                  </Copy>
                </View>
                <Copy light bold style={{ flex: 1 }}>
                  {event.area}
                </Copy>
              </View>
              <Heading light size={33}>
                {es ? event.title_es : event.title_en}
              </Heading>
              {isGoing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Check size={18} color={UI.tealLight} />
                  <Copy light bold>
                    {es ? 'Tu lugar está reservado' : 'Your spot is reserved'}
                  </Copy>
                </View>
              ) : null}
            </View>
            <View style={{ gap: 20 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Clock size={22} color={UI.tealDarker} />
                <Copy bold style={{ flex: 1 }}>
                  {date?.toLocaleString(es ? 'es-DO' : 'en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </Copy>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MapPin size={22} color={UI.tealDarker} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Copy bold>{event.location_name}</Copy>
                  <Copy muted>{event.area}</Copy>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Users size={22} color={UI.tealDarker} />
                <Copy muted style={{ flex: 1 }}>
                  {event.rsvp_count}/{event.capacity} {es ? 'lugares reservados' : 'spots reserved'}
                </Copy>
              </View>
            </View>
            <View style={{ gap: 12 }}>
              <Heading size={24}>{es ? 'El plan' : 'The plan'}</Heading>
              <Copy size={16}>{es ? event.description_es : event.description_en}</Copy>
            </View>
            {actionError ? <FieldError>{actionError}</FieldError> : null}
          </>
        )}
      </AppScreen>
      {event && !loading && !error ? (
        <View style={{ backgroundColor: UI.surface, borderTopWidth: 1, borderTopColor: UI.border }}>
          <View
            style={[layout.content, { paddingVertical: 14, paddingBottom: insets.bottom + 14 }]}
          >
            <Action
              secondary={Boolean(isGoing)}
              icon={isGoing ? Check : CalendarDays}
              disabled={isPending || (!isGoing && event.rsvp_count >= event.capacity)}
              label={
                isPending
                  ? es
                    ? 'Actualizando…'
                    : 'Updating…'
                  : isGoing
                    ? es
                      ? 'Cancelar reserva'
                      : 'Cancel RSVP'
                    : event.rsvp_count >= event.capacity
                      ? es
                        ? 'Evento completo'
                        : 'Meetup full'
                      : es
                        ? 'Reservar gratis'
                        : 'RSVP free'
              }
              onPress={() => void act()}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
