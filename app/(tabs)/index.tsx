import { ScrollView, View } from 'react-native';
import { Button, Card, Chip, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useConversations, useEvents, useMyRsvps, useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function HomeScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: profile } = useProfile(user?.id);
  const { data: events = [] } = useEvents();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { data: conversations = [] } = useConversations(user?.id);
  const nextRsvp = events.find((event) => rsvps.some((rsvp) => rsvp.event_id === event.id));

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 p-5 pb-safe-offset-8"
    >
      <View className="gap-1 pt-2">
        <Typography.Heading type="h2">
          {language === 'es'
            ? `Hola, ${profile?.display_name || 'Nómada'}`
            : `Hi, ${profile?.display_name || 'Nomad'}`}
        </Typography.Heading>
        <Chip size="sm" variant="soft" color="accent">
          <Chip.Label>Dos idiomas. Un coro.</Chip.Label>
        </Chip>
      </View>

      <Card className="gap-4 p-5">
        <Typography.Heading type="h4">
          {language === 'es' ? 'Tu próximo encuentro' : 'Your next meetup'}
        </Typography.Heading>
        {nextRsvp ? (
          <>
            <Typography.Heading type="h3">
              {language === 'es' ? nextRsvp.title_es : nextRsvp.title_en}
            </Typography.Heading>
            <Typography.Paragraph color="muted">
              {nextRsvp.location_name} · {nextRsvp.area}
            </Typography.Paragraph>
            <Button
              variant="secondary"
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: nextRsvp.id } })}
            >
              <Button.Label>{language === 'es' ? 'Ver evento' : 'View event'}</Button.Label>
            </Button>
          </>
        ) : (
          <>
            <Typography.Paragraph color="muted">
              {language === 'es'
                ? 'Explora los próximos encuentros y reserva tu lugar.'
                : 'Explore upcoming meetups and save your spot.'}
            </Typography.Paragraph>
            <Button onPress={() => router.push('/(tabs)/events')}>
              <Button.Label>{language === 'es' ? 'Ver eventos' : 'Browse events'}</Button.Label>
            </Button>
          </>
        )}
      </Card>

      <Card className="gap-3 p-5">
        <Typography.Heading type="h4">
          {language === 'es' ? 'Conversaciones' : 'Conversations'}
        </Typography.Heading>
        <Typography.Heading type="h2">{conversations.length}</Typography.Heading>
        <Button variant="ghost" onPress={() => router.push('/(tabs)/inbox')}>
          <Button.Label>{language === 'es' ? 'Abrir inbox' : 'Open inbox'}</Button.Label>
        </Button>
      </Card>
    </ScrollView>
  );
}
