import { Linking, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Card, Typography } from 'heroui-native';

export default function SupportScreen() {
  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-4 p-safe-offset-5">
      <Stack.Screen options={{ headerShown: true, title: 'Soporte' }} />
      <Typography.Heading type="h2">Soporte y seguridad</Typography.Heading>
      <Card className="gap-3 p-5">
        <Typography.Heading type="h4">¿Necesitas ayuda?</Typography.Heading>
        <Typography.Paragraph color="muted">
          Escríbenos para recibir soporte o informar un problema de seguridad.
        </Typography.Paragraph>
        <Button onPress={() => void Linking.openURL('mailto:support@nomadalingo.com')}>
          <Button.Label>support@nomadalingo.com</Button.Label>
        </Button>
      </Card>
    </ScrollView>
  );
}
