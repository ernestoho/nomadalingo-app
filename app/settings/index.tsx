import { useState } from 'react';
import { View } from 'react-native';
import { FieldError, Separator } from 'heroui-native';
import { router } from 'expo-router';
import {
  FileText,
  Languages,
  LifeBuoy,
  LogOut,
  Pencil,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, NavigationRow, Panel } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';
import { signOut } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function SettingsScreen() {
  const { language, setLanguage } = useI18n();
  const es = language === 'es';
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setError('');
    try {
      const { error: authError } = await signOut();
      if (authError) throw new Error(authError.message);
      router.replace('/(auth)');
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo cerrar sesión.'
            : 'Could not sign out.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSigningOut(false);
    }
  };
  return (
    <AppScreen topInset={false}>
      <RouteHeader
        title={es ? 'Configuración' : 'Settings'}
        fallback="/(tabs)/profile"
        fallbackLabel={es ? 'Tu perfil' : 'Your profile'}
      />
      <Heading size={36}>{es ? 'A tu manera.' : 'Make it yours.'}</Heading>
      <View style={{ gap: 14 }}>
        <Heading size={22}>{es ? 'Tu cuenta' : 'Your account'}</Heading>
        <Panel>
          <View>
            <NavigationRow
              icon={Pencil}
              title={es ? 'Editar perfil' : 'Edit profile'}
              onPress={() => router.push('/settings/edit-profile')}
            />
            <Separator />
            <NavigationRow
              icon={Languages}
              title={es ? 'Idioma' : 'Language'}
              trailing={<Copy bold>{es ? 'Español' : 'English'}</Copy>}
              onPress={() => {
                void Haptics.selectionAsync();
                setLanguage(es ? 'en' : 'es');
              }}
            />
          </View>
        </Panel>
      </View>
      <View style={{ gap: 14 }}>
        <Heading size={22}>{es ? 'Comunidad y ayuda' : 'Community and help'}</Heading>
        <Panel>
          <View>
            <NavigationRow
              icon={ShieldCheck}
              title={es ? 'Privacidad' : 'Privacy'}
              onPress={() => router.push('/settings/privacy')}
            />
            <Separator />
            <NavigationRow
              icon={FileText}
              title={es ? 'Términos de uso' : 'Terms of use'}
              onPress={() => router.push('/settings/terms')}
            />
            <Separator />
            <NavigationRow
              icon={LifeBuoy}
              title={es ? 'Soporte y seguridad' : 'Support and safety'}
              onPress={() => router.push('/settings/support')}
            />
          </View>
        </Panel>
      </View>
      {error ? <FieldError>{error}</FieldError> : null}
      <Action
        secondary
        icon={LogOut}
        disabled={isSigningOut}
        label={
          isSigningOut
            ? es
              ? 'Cerrando sesión…'
              : 'Signing out…'
            : es
              ? 'Cerrar sesión'
              : 'Sign out'
        }
        onPress={() => void handleSignOut()}
      />
      <NavigationRow
        danger
        icon={Trash2}
        title={es ? 'Eliminar cuenta' : 'Delete account'}
        onPress={() => router.push('/settings/delete-account')}
      />
      <Copy muted size={12} style={{ textAlign: 'center' }}>
        NómadaLingo
      </Copy>
    </AppScreen>
  );
}
