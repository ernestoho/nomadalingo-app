import { ShieldCheck } from 'lucide-react-native';
import { AppScreen } from '@/components/AppScreen';
import { Copy, Heading, UI } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';

export default function PrivacyScreen() {
  return (
    <AppScreen topInset={false}>
      <RouteHeader title="Privacidad" fallback="/settings" fallbackLabel="Configuración" />
      <ShieldCheck size={40} color={UI.tealDarker} strokeWidth={1.7} />
      <Heading size={36}>Privacidad</Heading>
      <Copy size={17}>
        NómadaLingo usa tu cuenta, perfil de idiomas, reservas y mensajes para ofrecer la comunidad.
        Tu correo no aparece en tu perfil público. No vendemos tus datos.
      </Copy>
      <Copy size={17}>
        Los reportes de seguridad pueden incluir el mensaje reportado. Puedes bloquear personas y
        eliminar tu cuenta desde Configuración.
      </Copy>
    </AppScreen>
  );
}
