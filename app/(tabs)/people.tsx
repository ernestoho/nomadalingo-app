import { FlatList, View } from 'react-native';
import { Avatar, Button, Card, Chip, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { usePeople } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function PeopleScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const { data = [], isLoading, error, refetch } = usePeople(user?.id);
  const people = data.filter((profile) => profile.id !== user?.id);

  return (
    <FlatList
      className="bg-background flex-1"
      contentContainerClassName="gap-4 p-5 pb-safe-offset-8"
      data={people}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={() => void refetch()}
      ListHeaderComponent={
        <Typography.Heading type="h2">
          {language === 'es' ? 'Personas' : 'People'}
        </Typography.Heading>
      }
      ListEmptyComponent={
        <Typography.Paragraph color="muted">
          {error
            ? error.message
            : language === 'es'
              ? 'Pronto aparecerán más personas para practicar.'
              : 'More people to practice with will appear soon.'}
        </Typography.Paragraph>
      }
      renderItem={({ item }) => (
        <Card className="gap-4 p-5">
          <View className="flex-row items-center gap-3">
            <Avatar alt={item.display_name}>
              <Avatar.Fallback>{item.display_name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar>
            <View className="flex-1 gap-1">
              <Typography.Heading type="h4">{item.display_name}</Typography.Heading>
              <Typography.Paragraph type="body-sm" color="muted">
                {item.bio}
              </Typography.Paragraph>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {item.learning_languages.map((value) => (
              <Chip key={value} size="sm" variant="soft">
                <Chip.Label>{value}</Chip.Label>
              </Chip>
            ))}
          </View>
          <Button
            variant="secondary"
            onPress={() => router.push({ pathname: '/person/[id]', params: { id: item.id } })}
          >
            <Button.Label>{language === 'es' ? 'Ver perfil' : 'View profile'}</Button.Label>
          </Button>
        </Card>
      )}
    />
  );
}
