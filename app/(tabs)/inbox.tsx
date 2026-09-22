import { ScrollView, View } from 'react-native';
import { Button, Card, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useChatRequests, useConversations, useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function InboxScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: requests = [] } = useChatRequests(user?.id);
  const { data: conversations = [] } = useConversations(user?.id);
  const { acceptRequest, declineRequest } = useMvpActions();
  const incoming = requests.filter(
    (request) => request.recipient_id === user?.id && request.status === 'pending',
  );

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-5 p-5 pb-safe-offset-8"
    >
      <Typography.Heading type="h2">Inbox</Typography.Heading>
      {incoming.length ? (
        <View className="gap-3">
          <Typography.Heading type="h4">
            {language === 'es' ? 'Solicitudes' : 'Requests'}
          </Typography.Heading>
          {incoming.map((request) => (
            <Card key={request.id} className="gap-3 p-4">
              <Typography.Paragraph>
                {language === 'es'
                  ? 'Alguien quiere practicar contigo.'
                  : 'Someone wants to practice with you.'}
              </Typography.Paragraph>
              <View className="flex-row gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onPress={() => void acceptRequest.mutateAsync(request.id)}
                >
                  <Button.Label>{language === 'es' ? 'Aceptar' : 'Accept'}</Button.Label>
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  variant="secondary"
                  onPress={() => void declineRequest.mutateAsync(request.id)}
                >
                  <Button.Label>{language === 'es' ? 'Rechazar' : 'Decline'}</Button.Label>
                </Button>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
      <Typography.Heading type="h4">
        {language === 'es' ? 'Conversaciones' : 'Conversations'}
      </Typography.Heading>
      {conversations.length ? (
        conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant="secondary"
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
          >
            <Button.Label>
              {language === 'es' ? 'Abrir conversación' : 'Open conversation'}
            </Button.Label>
          </Button>
        ))
      ) : (
        <Typography.Paragraph color="muted">
          {language === 'es'
            ? 'Todavía no tienes conversaciones.'
            : 'You do not have conversations yet.'}
        </Typography.Paragraph>
      )}
    </ScrollView>
  );
}
