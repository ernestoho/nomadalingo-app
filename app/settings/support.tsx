import { useState } from 'react';
import { Linking } from 'react-native';
import { FieldError } from 'heroui-native';
import { LifeBuoy, Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, UI } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';

export default function SupportScreen() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const contact = async () => {
    setError('');
    setPending(true);
    try {
      await Linking.openURL('mailto:support@nomadalingo.com');
    } catch {
      setError('No se pudo abrir el correo. Escríbenos a support@nomadalingo.com.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  };
  return (
    <AppScreen topInset={false}>
      <RouteHeader title="Soporte" fallback="/settings" fallbackLabel="Configuración" />
      <LifeBuoy size={44} color={UI.tealDarker} strokeWidth={1.7} />
      <Heading size={36}>Soporte y seguridad</Heading>
      <Heading size={24}>¿Necesitas ayuda?</Heading>
      <Copy muted size={17}>
        Escríbenos para recibir soporte o informar un problema de seguridad.
      </Copy>
      <Copy bold>support@nomadalingo.com</Copy>
      {error ? <FieldError>{error}</FieldError> : null}
      <Action
        icon={Mail}
        disabled={pending}
        label={pending ? 'Abriendo correo…' : 'Escribir correo'}
        onPress={() => void contact()}
      />
    </AppScreen>
  );
}
