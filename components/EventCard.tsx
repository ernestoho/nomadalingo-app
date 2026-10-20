import { View } from 'react-native';
import { PressableFeedback } from 'heroui-native';
import { ArrowUpRight, MapPin, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { Copy, Heading, UI } from '@/components/Coastal';
import type { Event } from '@/lib/data/mvp';

export function EventCard({ event, language }: { event: Event; language: 'es' | 'en' }) {
  const es = language === 'es';
  const date = new Date(event.starts_at);
  return (
    <PressableFeedback
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      accessibilityRole="button"
      accessibilityLabel={es ? event.title_es : event.title_en}
      style={{ borderRadius: 26 }}
    >
      <View style={{ padding: 22, borderRadius: 26, backgroundColor: UI.surface, gap: 20 }}>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: UI.tealLight,
              borderRadius: 17,
              padding: 12,
              alignItems: 'center',
              minWidth: 66,
            }}
          >
            <Heading size={28}>{date.getDate()}</Heading>
            <Copy bold size={12}>
              {date.toLocaleDateString(es ? 'es-DO' : 'en-US', { month: 'short' })}
            </Copy>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Copy bold size={13} style={{ color: UI.tealDarker }}>
              {event.area}
            </Copy>
            <Copy muted size={13}>
              {date.toLocaleTimeString(es ? 'es-DO' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Copy>
          </View>
          <ArrowUpRight size={22} color={UI.tealDarker} />
        </View>
        <Heading size={25}>{es ? event.title_es : event.title_en}</Heading>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <MapPin size={17} color={UI.muted} />
          <Copy muted size={14} style={{ flex: 1 }}>
            {event.location_name}
          </Copy>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: UI.border,
            paddingTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Users size={17} color={UI.tealDarker} />
          <Copy size={13} bold>
            {event.rsvp_count}/{event.capacity}
          </Copy>
          <Copy muted size={13}>
            {es ? 'lugares reservados' : 'spots reserved'}
          </Copy>
        </View>
      </View>
    </PressableFeedback>
  );
}
