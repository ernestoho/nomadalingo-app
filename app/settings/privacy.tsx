import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from 'heroui-native';

export default function PrivacyScreen() {
  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-4 p-safe-offset-5">
      <Stack.Screen options={{ headerShown: true, title: 'Privacidad' }} />
      <Typography.Heading type="h2">Privacidad</Typography.Heading>
      <Typography.Paragraph>
        NómadaLingo usa tu cuenta, perfil de idiomas, reservas y mensajes para ofrecer la comunidad.
        Tu correo no aparece en tu perfil público. No vendemos tus datos.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Los reportes de seguridad pueden incluir el mensaje reportado. Puedes bloquear personas y
        eliminar tu cuenta desde Configuración.
      </Typography.Paragraph>
    </ScrollView>
  );
}
