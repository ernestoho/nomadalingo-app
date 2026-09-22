import { FlatList, View } from 'react-native';
import { Button, Card, Chip, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useEvents } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function EventsScreen() {
  const { language } = useI18n();
  const { data = [], isLoading, error, refetch } = useEvents();

  return (
    <FlatList
      className="bg-background flex-1"
      contentContainerClassName="gap-4 p-5 pb-safe-offset-8"
      data={data}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={() => void refetch()}
      ListHeaderComponent={
        <Typography.Heading type="h2">
          {language === 'es' ? 'Eventos' : 'Events'}
        </Typography.Heading>
      }
      ListEmptyComponent={
        <Typography.Paragraph color="muted">
          {error
            ? error.message
            : language === 'es'
              ? 'No hay eventos publicados todavía.'
              : 'No events are published yet.'}
        </Typography.Paragraph>
      }
      renderItem={({ item }) => (
        <Card className="gap-3 p-5">
          <View className="flex-row items-center justify-between gap-3">
            <Chip size="sm" variant="soft" color="accent">
              <Chip.Label>{item.area}</Chip.Label>
            </Chip>
            <Typography.Paragraph type="body-sm" color="muted">
              {new Date(item.starts_at).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Typography.Paragraph>
          </View>
          <Typography.Heading type="h3">
            {language === 'es' ? item.title_es : item.title_en}
          </Typography.Heading>
          <Typography.Paragraph color="muted">{item.location_name}</Typography.Paragraph>
          <Typography.Paragraph type="body-sm" color="muted">
            {item.rsvp_count}/{item.capacity} {language === 'es' ? 'personas' : 'people'}
          </Typography.Paragraph>
          <Button
            variant="secondary"
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
          >
            <Button.Label>{language === 'es' ? 'Ver detalles' : 'View details'}</Button.Label>
          </Button>
        </Card>
      )}
    />
  );
}
