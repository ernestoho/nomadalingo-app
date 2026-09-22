import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, FieldError, Input, Label, TextField, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { LanguageToggle } from '@/components/LanguageToggle';
import { requestEmailCode } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function SignInScreen() {
  const { language } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    if (!email.trim().includes('@')) {
      setError(language === 'es' ? 'Escribe un correo válido.' : 'Enter a valid email.');
      return;
    }
    setIsSending(true);
    setError('');
    const { error: authError } = await requestEmailCode(email);
    setIsSending(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push({ pathname: '/(auth)/verify', params: { email: email.trim().toLowerCase() } });
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="p-safe-offset-6 flex-1 justify-between gap-8">
        <View className="items-end">
          <LanguageToggle />
        </View>
        <View className="gap-7">
          <View className="gap-2">
            <Typography.Heading type="h1">NómadaLingo</Typography.Heading>
            <Typography.Heading type="h4" color="muted">
              Dos idiomas. Un coro.
            </Typography.Heading>
          </View>
          <TextField isInvalid={Boolean(error)}>
            <Label>{language === 'es' ? 'Correo electrónico' : 'Email'}</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="tu@correo.com"
              onSubmitEditing={() => void submit()}
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </TextField>
          <Button onPress={() => void submit()} isDisabled={isSending}>
            <Button.Label>
              {isSending ? 'Enviando…' : language === 'es' ? 'Recibir código' : 'Get code'}
            </Button.Label>
          </Button>
        </View>
        <Typography.Paragraph color="muted" type="body-sm" align="center">
          {language === 'es' ? 'Para personas mayores de 18 años.' : 'For adults 18 and over.'}
        </Typography.Paragraph>
      </View>
    </KeyboardAvoidingView>
  );
}
