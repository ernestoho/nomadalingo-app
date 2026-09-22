import { ScrollView, View } from 'react-native';
import { Avatar, Button, Card, Chip, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: profile } = useProfile(user?.id);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-5 p-5 pb-safe-offset-8"
    >
      <Typography.Heading type="h2">{language === 'es' ? 'Perfil' : 'Profile'}</Typography.Heading>
      <Card className="items-center gap-4 p-6">
        <Avatar size="lg" alt={profile?.display_name || 'N'}>
          <Avatar.Fallback>
            {(profile?.display_name || 'N').slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <Typography.Heading type="h3">{profile?.display_name || 'Nómada'}</Typography.Heading>
        {profile?.bio ? (
          <Typography.Paragraph align="center" color="muted">
            {profile.bio}
          </Typography.Paragraph>
        ) : null}
      </Card>
      <View className="gap-3">
        <Typography.Heading type="h4">{language === 'es' ? 'Habla' : 'Speaks'}</Typography.Heading>
        <View className="flex-row flex-wrap gap-2">
          {profile?.spoken_languages.map((item) => (
            <Chip key={item}>
              <Chip.Label>{item}</Chip.Label>
            </Chip>
          ))}
        </View>
      </View>
      <View className="gap-3">
        <Typography.Heading type="h4">
          {language === 'es' ? 'Practica' : 'Practices'}
        </Typography.Heading>
        <View className="flex-row flex-wrap gap-2">
          {profile?.learning_languages.map((item) => (
            <Chip key={item} color="accent">
              <Chip.Label>{item}</Chip.Label>
            </Chip>
          ))}
        </View>
      </View>
      <Button variant="secondary" onPress={() => router.push('/settings/edit-profile')}>
        <Button.Label>{language === 'es' ? 'Editar perfil' : 'Edit profile'}</Button.Label>
      </Button>
      <Button variant="ghost" onPress={() => router.push('/settings')}>
        <Button.Label>{language === 'es' ? 'Configuración' : 'Settings'}</Button.Label>
      </Button>
    </ScrollView>
  );
}
