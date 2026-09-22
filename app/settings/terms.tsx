import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from 'heroui-native';

export default function TermsScreen() {
  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-4 p-safe-offset-5">
      <Stack.Screen options={{ headerShown: true, title: 'Términos' }} />
      <Typography.Heading type="h2">Términos de uso</Typography.Heading>
      <Typography.Paragraph>
        NómadaLingo es una comunidad para adultos de 18 años o más. Trata a las demás personas con
        respeto. No se permite acoso, odio, spam, suplantación ni contenido sexual no solicitado.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Las reservas de esta versión son gratuitas. Podemos moderar contenido o restringir cuentas
        para proteger a la comunidad.
      </Typography.Paragraph>
    </ScrollView>
  );
}
