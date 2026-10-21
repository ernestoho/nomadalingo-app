import { useCallback, useState } from 'react';
import { SectionList, View } from 'react-native';
import { FieldError, PressableFeedback } from 'heroui-native';
import { ChevronRight, MessageCircle, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Action,
  Copy,
  Heading,
  ProfileAvatar,
  ScreenHeading,
  UI,
  layout,
} from '@/components/Coastal';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import {
  useChatRequests,
  useConversations,
  useMvpActions,
  usePeople,
  type ChatRequest,
  type Conversation,
} from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

type Row = { kind: 'request'; value: ChatRequest } | { kind: 'conversation'; value: Conversation };
export default function InboxScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const requestQuery = useChatRequests(user?.id);
  const conversationQuery = useConversations(user?.id);
  const peopleQuery = usePeople(user?.id);
  const { acceptRequest, declineRequest } = useMvpActions();
  const [actionError, setActionError] = useState('');
  const { refetch: refetchRequests } = requestQuery;
  const { refetch: refetchConversations } = conversationQuery;
  const { refetch: refetchPeople } = peopleQuery;
  const refresh = useCallback(
    () => Promise.all([refetchRequests(), refetchConversations(), refetchPeople()]),
    [refetchRequests, refetchConversations, refetchPeople],
  );
  useRefreshOnFocus(refresh);
  const incoming = (requestQuery.data || []).filter(
    (request) => request.recipient_id === user?.id && request.status === 'pending',
  );
  const error = requestQuery.error || conversationQuery.error;
  const loading = requestQuery.isLoading || conversationQuery.isLoading;
  const pending = acceptRequest.isPending || declineRequest.isPending;
  const act = async (id: string, accept: boolean) => {
    setActionError('');
    try {
      if (accept) await acceptRequest.mutateAsync(id);
      else await declineRequest.mutateAsync(id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo actualizar la solicitud.'
            : 'Could not update the request.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  const sections: { title: string; kind: 'request' | 'conversation'; data: Row[] }[] =
    loading || error
      ? []
      : [
          {
            title: es ? 'Solicitudes' : 'Requests',
            kind: 'request',
            data: incoming.map((value) => ({ kind: 'request', value })),
          },
          {
            title: es ? 'Conversaciones' : 'Conversations',
            kind: 'conversation',
            data: (conversationQuery.data || []).map((value) => ({ kind: 'conversation', value })),
          },
        ];
  return (
    <SectionList<Row>
      style={layout.screen}
      contentContainerStyle={[
        layout.content,
        { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 32 },
      ]}
      sections={sections}
      keyExtractor={(item) => item.value.id}
      stickySectionHeadersEnabled={false}
      refreshing={
        requestQuery.isRefetching || conversationQuery.isRefetching || peopleQuery.isRefetching
      }
      onRefresh={() => void refresh()}
      ListHeaderComponent={
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <ScreenHeading title={es ? 'Buenas\nconversaciones.' : 'Good\nconversations.'} />
          {actionError ? <FieldError>{actionError}</FieldError> : null}
          {loading || error ? (
            <StateView
              loading={loading}
              error={Boolean(error)}
              message={
                error?.message || (es ? 'Cargando conversaciones…' : 'Loading conversations…')
              }
              actionLabel={es ? 'Reintentar' : 'Retry'}
              onAction={() => void refresh()}
            />
          ) : peopleQuery.error ? (
            <StateView
              error
              message={`${es ? 'No se pudieron cargar los perfiles.' : 'Could not load the profiles.'} ${peopleQuery.error.message}`}
              actionLabel={es ? 'Reintentar' : 'Retry'}
              onAction={() => void refetchPeople()}
            />
          ) : null}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={{ paddingTop: 12, paddingBottom: 16 }}>
          <Heading size={22}>{section.title}</Heading>
        </View>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length ? (
          <View style={{ height: 18 }} />
        ) : (
          <StateView
            icon={section.kind === 'request' ? UserPlus : MessageCircle}
            message={
              section.kind === 'request'
                ? es
                  ? 'Aquí recibirás las invitaciones para conversar.'
                  : 'Chat invitations will appear here.'
                : es
                  ? 'Encuentra a alguien y empieza una conversación.'
                  : 'Find someone and start a conversation.'
            }
            actionLabel={es ? 'Conocer personas' : 'Meet people'}
            onAction={() => router.push('/(tabs)/people')}
          />
        )
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => {
        const otherId =
          item.kind === 'request'
            ? item.value.sender_id
            : item.value.participant_low_id === user?.id
              ? item.value.participant_high_id
              : item.value.participant_low_id;
        const person = peopleQuery.data?.find((profile) => profile.id === otherId);
        const name = person?.display_name || (es ? 'Conversación' : 'Conversation');
        if (item.kind === 'request')
          return (
            <Animated.View
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(100)}
              style={{ backgroundColor: UI.surface, padding: 20, borderRadius: 24, gap: 18 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <ProfileAvatar name={name} id={otherId} size={54} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Copy bold size={16}>
                    {name}
                  </Copy>
                  <Copy muted size={13}>
                    {es ? 'Quiere practicar contigo' : 'Wants to practice with you'}
                  </Copy>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Action
                    compact
                    disabled={pending}
                    label={
                      acceptRequest.isPending && acceptRequest.variables === item.value.id
                        ? es
                          ? 'Aceptando…'
                          : 'Accepting…'
                        : es
                          ? 'Aceptar'
                          : 'Accept'
                    }
                    onPress={() => void act(item.value.id, true)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Action
                    compact
                    secondary
                    disabled={pending}
                    label={
                      declineRequest.isPending && declineRequest.variables === item.value.id
                        ? es
                          ? 'Rechazando…'
                          : 'Declining…'
                        : es
                          ? 'Rechazar'
                          : 'Decline'
                    }
                    onPress={() => void act(item.value.id, false)}
                  />
                </View>
              </View>
            </Animated.View>
          );
        const conversation = item.value;
        return (
          <PressableFeedback
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
            accessibilityRole="button"
            accessibilityLabel={name}
            style={{ borderRadius: 24 }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 14,
                alignItems: 'center',
                backgroundColor: UI.surface,
                padding: 20,
                borderRadius: 24,
              }}
            >
              <ProfileAvatar name={name} id={otherId} size={56} />
              <View style={{ flex: 1, gap: 4 }}>
                <Copy bold size={16}>
                  {name}
                </Copy>
                <Copy muted size={13}>
                  {conversation.last_message_at
                    ? new Date(conversation.last_message_at).toLocaleDateString(
                        es ? 'es-DO' : 'en-US',
                        { month: 'short', day: 'numeric' },
                      )
                    : es
                      ? 'Empieza con un hola'
                      : 'Start with a hello'}
                </Copy>
              </View>
              <ChevronRight size={20} color={UI.tealDarker} />
            </View>
          </PressableFeedback>
        );
      }}
    />
  );
}
