import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Button } from 'heroui-native';
import { AppScreen } from '@/components/AppScreen';
import { ProfileSummary } from '@/components/ProfileSummary';
import { StateView } from '@/components/StateView';
import { UI } from '@/components/Coastal';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const { data: profile, isLoading, isRefetching, error, refetch } = useProfile(user?.id);
  useRefreshOnFocus(refetch);
  return (
    <AppScreen
      title={es ? 'Tu perfil' : 'Your profile'}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      action={
        <Button
          isIconOnly
          variant="secondary"
          accessibilityLabel={es ? 'Configuración' : 'Settings'}
          onPress={() => router.push('/settings')}
          style={{ borderRadius: 18, width: 48, height: 48 }}
        >
          <Settings size={22} strokeWidth={2} color={UI.tealDarker} />
        </Button>
      }
    >
      {profile && !error ? (
        <ProfileSummary
          profile={profile}
          language={language}
          onEdit={() => router.push('/settings/edit-profile')}
        />
      ) : (
        <StateView
          loading={isLoading}
          error={Boolean(error)}
          message={
            error?.message || (es ? 'No se pudo cargar tu perfil.' : 'Could not load your profile.')
          }
          actionLabel={es ? 'Reintentar' : 'Retry'}
          onAction={() => void refetch()}
        />
      )}
    </AppScreen>
  );
}
