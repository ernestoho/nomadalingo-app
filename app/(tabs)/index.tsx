import { useCallback } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, CalendarDays, MessageCircle, Users } from 'lucide-react-native';
import { Button } from 'heroui-native';
import { AppScreen } from '@/components/AppScreen';
import {
  Action,
  Copy,
  Heading,
  NavigationRow,
  ProfileAvatar,
  SectionHeading,
  UI,
} from '@/components/Coastal';
import { EventCard } from '@/components/EventCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useConversations, useEvents, useMyRsvps, useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function HomeScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const profileQuery = useProfile(user?.id);
  const eventQuery = useEvents();
  const rsvpQuery = useMyRsvps(user?.id);
  const chatQuery = useConversations(user?.id);
  const { refetch: refetchProfile } = profileQuery;
  const { refetch: refetchEvents } = eventQuery;
  const { refetch: refetchRsvps } = rsvpQuery;
  const { refetch: refetchChats } = chatQuery;
  const refresh = useCallback(
    () => Promise.all([refetchProfile(), refetchEvents(), refetchRsvps(), refetchChats()]),
    [refetchProfile, refetchEvents, refetchRsvps, refetchChats],
  );
  useRefreshOnFocus(refresh);
  const profile = profileQuery.data;
  const nextRsvp = (eventQuery.data || []).find((event) =>
    (rsvpQuery.data || []).some((rsvp) => rsvp.event_id === event.id),
  );
  const error = eventQuery.error || rsvpQuery.error || chatQuery.error || profileQuery.error;
  const loading =
    eventQuery.isLoading || rsvpQuery.isLoading || chatQuery.isLoading || profileQuery.isLoading;
  const count = chatQuery.data?.length || 0;
  return (
    <AppScreen onRefresh={() => void refresh()} refreshing={eventQuery.isRefetching}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Button
          isIconOnly
          variant="ghost"
          accessibilityLabel={es ? 'Tu perfil' : 'Your profile'}
          onPress={() => router.push('/(tabs)/profile')}
          style={{ width: 56, height: 56, borderRadius: 28 }}
        >
          <ProfileAvatar name={profile?.display_name || 'Nómada'} id={user?.id} size={52} />
        </Button>
        <Heading size={27} style={{ flex: 1 }}>
          {profile?.display_name
            ? `${es ? 'Hola' : 'Hi'}, ${profile.display_name}`
            : es
              ? 'Hola, Nómada'
              : 'Hi, Nomad'}
        </Heading>
        <LanguageToggle />
      </View>
      <View style={{ backgroundColor: UI.ink, borderRadius: 30, padding: 26, gap: 24 }}>
        <View style={{ gap: 16 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: UI.coral,
              borderRadius: 18,
              borderBottomLeftRadius: 4,
              paddingHorizontal: 20,
              paddingVertical: 9,
            }}
          >
            <Heading size={27}>Hola.</Heading>
          </View>
          <View
            style={{
              alignSelf: 'flex-end',
              backgroundColor: UI.tealLight,
              borderRadius: 18,
              borderBottomRightRadius: 4,
              paddingHorizontal: 20,
              paddingVertical: 9,
            }}
          >
            <Heading size={27}>Hello.</Heading>
          </View>
        </View>
        <Heading light size={35}>
          {es ? 'El próximo coro\nempieza contigo.' : 'Your next connection\nstarts here.'}
        </Heading>
        <Action
          secondary
          icon={ArrowRight}
          label={es ? 'Conoce a la comunidad' : 'Meet the community'}
          onPress={() => router.push('/(tabs)/people')}
        />
      </View>
      {loading || error ? (
        <StateView
          loading={loading}
          error={Boolean(error)}
          message={error?.message || (es ? 'Cargando tu comunidad…' : 'Loading your community…')}
          actionLabel={es ? 'Reintentar' : 'Retry'}
          onAction={() => void refresh()}
        />
      ) : (
        <>
          <SectionHeading
            title={es ? 'Tu próximo encuentro' : 'Your next meetup'}
            action={es ? 'Eventos' : 'Events'}
            onPress={() => router.push('/(tabs)/events')}
          />
          {nextRsvp ? (
            <EventCard event={nextRsvp} language={language} />
          ) : (
            <View style={{ gap: 16, padding: 22, borderRadius: 26, backgroundColor: UI.surface }}>
              <CalendarDays size={30} color={UI.tealDarker} />
              <Copy muted>
                {es
                  ? 'Encuentra un encuentro y reserva tu lugar.'
                  : 'Find a meetup and save your spot.'}
              </Copy>
              <Action
                label={es ? 'Explorar eventos' : 'Browse events'}
                onPress={() => router.push('/(tabs)/events')}
              />
            </View>
          )}
          <View style={{ gap: 4 }}>
            <SectionHeading title={es ? 'Sigue conversando' : 'Keep talking'} />
            <NavigationRow
              icon={MessageCircle}
              title={es ? 'Tus conversaciones' : 'Your conversations'}
              description={
                count
                  ? `${count} ${es ? (count === 1 ? 'conversación' : 'conversaciones') : count === 1 ? 'conversation' : 'conversations'}`
                  : undefined
              }
              onPress={() => router.push('/(tabs)/inbox')}
            />
            <NavigationRow
              icon={Users}
              title={es ? 'Encuentra con quién practicar' : 'Find someone to practice with'}
              onPress={() => router.push('/(tabs)/people')}
            />
          </View>
        </>
      )}
    </AppScreen>
  );
}
