import { FlatList, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { layout, ScreenHeading } from '@/components/Coastal';
import { EventCard } from '@/components/EventCard';
import { StateView } from '@/components/StateView';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function EventsScreen() {
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, isRefetching, error, refetch } = useEvents();
  useRefreshOnFocus(refetch);
  return (
    <FlatList
      style={layout.screen}
      contentContainerStyle={[
        layout.content,
        { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 32 },
      ]}
      data={error ? [] : data}
      keyExtractor={(item) => item.id}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      ListHeaderComponent={
        <View style={{ paddingBottom: 24 }}>
          <ScreenHeading title={es ? 'Nos vemos\npor aquí.' : 'See you\naround.'} />
        </View>
      }
      ListEmptyComponent={
        <StateView
          icon={CalendarDays}
          loading={isLoading}
          error={Boolean(error)}
          message={
            error?.message ||
            (es ? 'Los nuevos encuentros aparecerán aquí.' : 'New meetups will appear here.')
          }
          actionLabel={es ? 'Actualizar' : 'Refresh'}
          onAction={() => void refetch()}
        />
      }
      renderItem={({ item }) => <EventCard event={item} language={language} />}
    />
  );
}
