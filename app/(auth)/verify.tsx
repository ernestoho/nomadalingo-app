import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, FieldError, Input, Label, TextField, Typography } from 'heroui-native';
import { router, useLocalSearchParams } from 'expo-router';

import { verifyEmailCode } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

export default function VerifyScreen() {
  const { language } = useI18n();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const verify = async () => {
    if (code.trim().length !== 6) {
      setError(language === 'es' ? 'Escribe el código de 6 dígitos.' : 'Enter the 6-digit code.');
      return;
    }
    setIsVerifying(true);
    setError('');
    const { error: authError } = await verifyEmailCode(email, code);
    setIsVerifying(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace('/(auth)/onboarding');
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="p-safe-offset-6 flex-1 justify-center gap-7">
        <View className="gap-2">
          <Typography.Heading type="h2">
            {language === 'es' ? 'Revisa tu correo' : 'Check your email'}
          </Typography.Heading>
          <Typography.Paragraph color="muted">{email}</Typography.Paragraph>
        </View>
        <TextField isInvalid={Boolean(error)}>
          <Label>{language === 'es' ? 'Código' : 'Code'}</Label>
          <Input
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            onSubmitEditing={() => void verify()}
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </TextField>
        <Button onPress={() => void verify()} isDisabled={isVerifying}>
          <Button.Label>
            {isVerifying ? 'Verificando…' : language === 'es' ? 'Continuar' : 'Continue'}
          </Button.Label>
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          <Button.Label>
            {language === 'es' ? 'Usar otro correo' : 'Use another email'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
