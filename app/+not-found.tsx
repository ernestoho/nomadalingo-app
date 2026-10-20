import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, UI } from '@/components/Coastal';
import { useI18n } from '@/lib/i18n';

export default function NotFoundScreen() {
  const { language } = useI18n();
  const es = language === 'es';
  return (
    <AppScreen>
      <Compass size={48} color={UI.tealDarker} strokeWidth={1.7} />
      <Heading size={38}>{es ? 'Por aquí no era.' : 'A little off course.'}</Heading>
      <Copy muted>{es ? 'Esta página no está disponible.' : 'This page is not available.'}</Copy>
      <Action label={es ? 'Ir al inicio' : 'Go to start'} onPress={() => router.replace('/')} />
    </AppScreen>
  );
}
