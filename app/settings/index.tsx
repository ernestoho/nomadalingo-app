import { ScrollView } from 'react-native';
import { Button, Separator, Typography } from 'heroui-native';
import { router, Stack } from 'expo-router';

import { signOut } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function SettingsScreen() {
  const { language, setLanguage } = useI18n();
  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-3 p-safe-offset-5">
      <Stack.Screen
        options={{ headerShown: true, title: language === 'es' ? 'Configuración' : 'Settings' }}
      />
      <Button variant="secondary" onPress={() => router.push('/settings/edit-profile')}>
        <Button.Label>{language === 'es' ? 'Editar perfil' : 'Edit profile'}</Button.Label>
      </Button>
      <Button variant="secondary" onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}>
        <Button.Label>{language === 'es' ? 'Cambiar a English' : 'Cambiar a español'}</Button.Label>
      </Button>
      <Separator />
      <Button variant="ghost" onPress={() => router.push('/settings/privacy')}>
        <Button.Label>{language === 'es' ? 'Privacidad' : 'Privacy'}</Button.Label>
      </Button>
      <Button variant="ghost" onPress={() => router.push('/settings/terms')}>
        <Button.Label>{language === 'es' ? 'Términos' : 'Terms'}</Button.Label>
      </Button>
      <Button variant="ghost" onPress={() => router.push('/settings/support')}>
        <Button.Label>
          {language === 'es' ? 'Soporte y seguridad' : 'Support and safety'}
        </Button.Label>
      </Button>
      <Separator />
      <Button variant="secondary" onPress={() => void signOut()}>
        <Button.Label>{language === 'es' ? 'Cerrar sesión' : 'Sign out'}</Button.Label>
      </Button>
      <Button
        variant="ghost"
        className="bg-danger"
        onPress={() => router.push('/settings/delete-account')}
      >
        <Button.Label>{language === 'es' ? 'Eliminar cuenta' : 'Delete account'}</Button.Label>
      </Button>
      <Typography.Paragraph type="body-sm" color="muted" align="center">
        NómadaLingo
      </Typography.Paragraph>
    </ScrollView>
  );
}
