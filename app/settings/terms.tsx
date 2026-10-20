import { FileText } from 'lucide-react-native';
import { AppScreen } from '@/components/AppScreen';
import { Copy, Heading, UI } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';

export default function TermsScreen() {
  return (
    <AppScreen topInset={false}>
      <RouteHeader title="Términos" fallback="/settings" fallbackLabel="Configuración" />
      <FileText size={40} color={UI.tealDarker} strokeWidth={1.7} />
      <Heading size={36}>Términos de uso</Heading>
      <Copy size={17}>
        NómadaLingo es una comunidad para adultos de 18 años o más. Trata a las demás personas con
        respeto. No se permite acoso, odio, spam, suplantación ni contenido sexual no solicitado.
      </Copy>
      <Copy size={17}>
        Las reservas de esta versión son gratuitas. Podemos moderar contenido o restringir cuentas
        para proteger a la comunidad.
      </Copy>
    </AppScreen>
  );
}
