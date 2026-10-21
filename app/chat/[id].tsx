import { useCallback, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, FieldError, Input, Spinner } from 'heroui-native';
import { randomUUID } from 'expo-crypto';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Copy, ProfileAvatar, UI, layout } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import {
  useConversations,
  useMessages,
  useMvpActions,
  usePeople,
  type Message,
} from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { BRAND_FONTS } from '@/lib/brand';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function ChatScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { isLoading, user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const messageQuery = useMessages(user?.id, id);
  const peopleQuery = usePeople(user?.id);
  const conversationQuery = useConversations(user?.id);
  const { refetch: refetchMessages } = messageQuery;
  const { refetch: refetchPeople } = peopleQuery;
  const { refetch: refetchConversations } = conversationQuery;
  const refresh = useCallback(
    () => Promise.all([refetchMessages(), refetchPeople(), refetchConversations()]),
    [refetchMessages, refetchPeople, refetchConversations],
  );
  useRefreshOnFocus(refresh);
  const { sendMessage } = useMvpActions();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<React.ComponentRef<typeof Input>>(null);
  const conversation = conversationQuery.data?.find((item) => item.id === id);
  const otherId =
    conversation?.participant_low_id === user?.id
      ? conversation?.participant_high_id
      : conversation?.participant_low_id;
  const person = peopleQuery.data?.find((profile) => profile.id === otherId);
  const queryError = conversationQuery.error || messageQuery.error;
  const queryLoading = conversationQuery.isLoading || messageQuery.isLoading;
  const retrying = Boolean(queryError) && (conversationQuery.isFetching || messageQuery.isFetching);
  const canSend = Boolean(conversation) && !queryLoading && !queryError;
  const send = async () => {
    const text = body.trim();
    if (!text || !user || !id || !canSend || sendMessage.isPending) return;
    setBody('');
    setError('');
    try {
      await sendMessage.mutateAsync({
        conversation_id: id,
        sender_id: user.id,
        client_id: randomUUID(),
        body: text,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (caught) {
      setBody(text);
      setError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo enviar el mensaje.'
            : 'Could not send your message.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)" />;
  return (
    <KeyboardAvoidingView
      style={layout.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', flex: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <RouteHeader
            title={person?.display_name || (es ? 'Conversación' : 'Conversation')}
            fallback="/(tabs)/inbox"
            fallbackLabel={es ? 'Ver conversaciones' : 'All conversations'}
          />
        </View>
        {person ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 22,
              paddingVertical: 14,
              backgroundColor: UI.surface,
            }}
          >
            <ProfileAvatar name={person.display_name} id={person.id} size={42} />
            <View style={{ flex: 1 }}>
              <Copy bold>{person.display_name}</Copy>
              <Copy muted size={12}>
                {person.learning_languages.join(' · ')}
              </Copy>
            </View>
          </View>
        ) : null}
        <FlatList
          ref={listRef}
          data={canSend ? messageQuery.data || [] : []}
          keyExtractor={(message) => message.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, gap: 14, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (canSend) listRef.current?.scrollToEnd({ animated: !reducedMotion });
          }}
          ListHeaderComponent={
            peopleQuery.error && canSend ? (
              <StateView
                error
                message={`${es ? 'No se pudo cargar el perfil.' : 'Could not load the profile.'} ${peopleQuery.error.message}`}
                actionLabel={es ? 'Reintentar' : 'Retry'}
                onAction={() => void refetchPeople()}
              />
            ) : null
          }
          ListEmptyComponent={
            <StateView
              loading={queryLoading || retrying}
              error={Boolean(queryError)}
              message={
                queryError?.message ||
                (!conversation
                  ? es
                    ? 'Esta conversación no está disponible.'
                    : 'This conversation is unavailable.'
                  : es
                    ? 'Todo empieza con un hola.'
                    : 'It all starts with hello.')
              }
              actionLabel={
                queryError
                  ? es
                    ? 'Reintentar'
                    : 'Retry'
                  : !conversation
                    ? es
                      ? 'Ver conversaciones'
                      : 'All conversations'
                    : es
                      ? 'Escribir mensaje'
                      : 'Write a message'
              }
              onAction={() => {
                if (queryError) void refresh();
                else if (!conversation) router.replace('/(tabs)/inbox');
                else inputRef.current?.focus();
              }}
            />
          }
          renderItem={({ item: message }) => {
            const mine = message.sender_id === user.id;
            return (
              <Animated.View
                entering={FadeIn.duration(130)}
                exiting={FadeOut.duration(90)}
                style={{
                  maxWidth: '86%',
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  borderRadius: 22,
                  borderBottomRightRadius: mine ? 5 : 22,
                  borderBottomLeftRadius: mine ? 22 : 5,
                  backgroundColor: mine ? UI.tealDarker : UI.surface,
                  paddingHorizontal: 17,
                  paddingVertical: 12,
                  gap: 5,
                }}
              >
                <Copy light={mine} size={16}>
                  {message.deleted_at
                    ? es
                      ? 'Mensaje eliminado'
                      : 'Message removed'
                    : message.body}
                </Copy>
                <Copy light={mine} muted size={11} style={{ textAlign: 'right' }}>
                  {new Date(message.created_at).toLocaleTimeString(es ? 'es-DO' : 'en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Copy>
              </Animated.View>
            );
          }}
        />
        {canSend ? (
          <View
            style={{
              backgroundColor: UI.surface,
              padding: 14,
              paddingBottom: insets.bottom + 14,
              gap: 10,
              borderTopWidth: 1,
              borderTopColor: UI.border,
            }}
          >
            {error ? <FieldError>{error}</FieldError> : null}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <Input
                ref={inputRef}
                style={{
                  flex: 1,
                  minHeight: 52,
                  maxHeight: 140,
                  borderRadius: 18,
                  fontFamily: BRAND_FONTS.body,
                }}
                value={body}
                onChangeText={setBody}
                maxLength={2000}
                placeholder={es ? 'Escribe un mensaje' : 'Write a message'}
                accessibilityLabel={es ? 'Mensaje' : 'Message'}
                editable={!sendMessage.isPending}
                onSubmitEditing={() => void send()}
              />
              <Button
                isIconOnly
                accessibilityLabel={
                  sendMessage.isPending
                    ? es
                      ? 'Enviando mensaje'
                      : 'Sending message'
                    : es
                      ? 'Enviar mensaje'
                      : 'Send message'
                }
                isDisabled={sendMessage.isPending || !body.trim()}
                onPress={() => void send()}
                style={{ height: 52, width: 52, borderRadius: 18 }}
              >
                {sendMessage.isPending ? (
                  <Spinner size="sm" color={UI.onDark} />
                ) : (
                  <Send size={21} color={UI.onDark} strokeWidth={2} />
                )}
              </Button>
            </View>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
