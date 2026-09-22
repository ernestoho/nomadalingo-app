import { ScrollView, View } from 'react-native';
import { Avatar, Button, Card, Chip, Typography } from 'heroui-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useMvpActions, usePeople } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function PersonScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { language } = useI18n();
  const { data = [] } = usePeople(user?.id);
  const { requestChat, blockUser, reportUser } = useMvpActions();
  const profile = data.find((item) => item.id === id);
  const languages = profile
    ? [...new Set(profile.spoken_languages.concat(profile.learning_languages))]
    : [];

  if (!profile)
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <Typography.Paragraph>
          {language === 'es' ? 'Perfil no disponible.' : 'Profile unavailable.'}
        </Typography.Paragraph>
      </View>
    );

  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="gap-5 p-safe-offset-5">
      <Stack.Screen options={{ headerShown: true, title: profile.display_name }} />
      <Card className="items-center gap-4 p-6">
        <Avatar size="lg" alt={profile.display_name}>
          <Avatar.Fallback>{profile.display_name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar>
        <Typography.Heading type="h2">{profile.display_name}</Typography.Heading>
        <Typography.Paragraph align="center" color="muted">
          {profile.bio}
        </Typography.Paragraph>
      </Card>
      <View className="gap-2">
        <Typography.Heading type="h4">
          {language === 'es' ? 'Idiomas' : 'Languages'}
        </Typography.Heading>
        <View className="flex-row flex-wrap gap-2">
          {languages.map((item) => (
            <Chip key={item}>
              <Chip.Label>{item}</Chip.Label>
            </Chip>
          ))}
        </View>
      </View>
      <Button isDisabled={requestChat.isPending} onPress={() => void requestChat.mutateAsync(id)}>
        <Button.Label>{language === 'es' ? 'Pedir conversación' : 'Request a chat'}</Button.Label>
      </Button>
      <Button
        variant="ghost"
        isDisabled={reportUser.isPending || !user}
        onPress={() => {
          if (!user) return;
          void reportUser.mutateAsync({
            reporter_id: user.id,
            reported_user_id: id,
            reason: 'other',
            details: 'Reporte enviado desde el perfil.',
          });
        }}
      >
        <Button.Label>{language === 'es' ? 'Reportar perfil' : 'Report profile'}</Button.Label>
      </Button>
      <Button
        variant="ghost"
        className="bg-danger"
        isDisabled={blockUser.isPending}
        onPress={() => void blockUser.mutateAsync(id)}
      >
        <Button.Label>{language === 'es' ? 'Bloquear persona' : 'Block person'}</Button.Label>
      </Button>
    </ScrollView>
  );
}
