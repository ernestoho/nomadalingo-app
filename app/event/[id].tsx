import { ScrollView, View } from 'react-native';
import { Button, Card, Typography } from 'heroui-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useEvents, useMyRsvps, useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function EventDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: events = [] } = useEvents();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { joinEvent, cancelRsvp } = useMvpActions();
  const event = events.find((item) => item.id === id);
  const isGoing = rsvps.some((item) => item.event_id === id);

  if (!event)
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <Typography.Paragraph>
          {language === 'es' ? 'Evento no encontrado.' : 'Event not found.'}
        </Typography.Paragraph>
      </View>
    );

  const act = async () => {
    if (isGoing) await cancelRsvp.mutateAsync(id);
    else await joinEvent.mutateAsync(id);
  };
  const isPending = joinEvent.isPending || cancelRsvp.isPending;

  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-5 p-safe-offset-5">
      <Stack.Screen
        options={{ headerShown: true, title: language === 'es' ? 'Evento' : 'Event' }}
      />
      <Typography.Heading type="h2">
        {language === 'es' ? event.title_es : event.title_en}
      </Typography.Heading>
      <Typography.Paragraph color="muted">
        {new Date(event.starts_at).toLocaleString(language === 'es' ? 'es-DO' : 'en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </Typography.Paragraph>
      <Card className="gap-2 p-5">
        <Typography.Heading type="h4">{event.location_name}</Typography.Heading>
        <Typography.Paragraph color="muted">{event.area}</Typography.Paragraph>
      </Card>
      <Typography.Paragraph>
        {language === 'es' ? event.description_es : event.description_en}
      </Typography.Paragraph>
      <Typography.Paragraph color="muted">
        {event.rsvp_count}/{event.capacity}{' '}
        {language === 'es' ? 'lugares reservados' : 'spots reserved'}
      </Typography.Paragraph>
      <Button
        variant={isGoing ? 'secondary' : 'primary'}
        isDisabled={isPending || (!isGoing && event.rsvp_count >= event.capacity)}
        onPress={() => void act()}
      >
        <Button.Label>
          {isPending
            ? '…'
            : isGoing
              ? language === 'es'
                ? 'Cancelar reserva'
                : 'Cancel RSVP'
              : language === 'es'
                ? 'Reservar gratis'
                : 'RSVP free'}
        </Button.Label>
      </Button>
    </ScrollView>
  );
}
