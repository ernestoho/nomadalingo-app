import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Typography } from 'heroui-native';
import { randomUUID } from 'expo-crypto';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useMessages, useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function ChatScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: messages = [], refetch } = useMessages(id);
  const { sendMessage } = useMvpActions();
  const [body, setBody] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => void refetch(), 5000);
    return () => clearInterval(timer);
  }, [refetch]);

  const send = async () => {
    const text = body.trim();
    if (!text || !user || !id) return;
    setBody('');
    try {
      await sendMessage.mutateAsync({
        conversation_id: id,
        sender_id: user.id,
        client_id: randomUUID(),
        body: text,
      });
    } catch {
      setBody(text);
    }
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{ headerShown: true, title: language === 'es' ? 'Conversación' : 'Conversation' }}
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length ? (
          messages.map((message) => {
            const mine = message.sender_id === user?.id;
            return (
              <View
                key={message.id}
                className={`max-w-[82%] rounded-2xl p-3 ${mine ? 'bg-accent self-end' : 'bg-surface-secondary self-start'}`}
              >
                <Typography.Paragraph
                  className={mine ? 'text-accent-foreground' : 'text-foreground'}
                >
                  {message.deleted_at
                    ? language === 'es'
                      ? 'Mensaje eliminado'
                      : 'Message removed'
                    : message.body}
                </Typography.Paragraph>
              </View>
            );
          })
        ) : (
          <Typography.Paragraph align="center" color="muted">
            {language === 'es' ? 'Empieza la conversación.' : 'Start the conversation.'}
          </Typography.Paragraph>
        )}
      </ScrollView>
      <View className="border-border pb-safe-offset-3 flex-row gap-2 border-t p-3">
        <Input
          className="flex-1"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
          placeholder={language === 'es' ? 'Escribe un mensaje' : 'Write a message'}
          onSubmitEditing={() => void send()}
        />
        <Button
          isIconOnly
          isDisabled={sendMessage.isPending || !body.trim()}
          onPress={() => void send()}
        >
          <Button.Label>↑</Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
