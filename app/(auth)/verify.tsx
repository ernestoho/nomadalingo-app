import { useState } from 'react';
import { View } from 'react-native';
import { FieldError, Input, Label, TextField } from 'heroui-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, Panel, UI } from '@/components/Coastal';
import { LanguageToggle } from '@/components/LanguageToggle';
import { verifyEmailCode } from '@/lib/auth-actions';
import { goBackOrReplace } from '@/lib/navigation';
import { BRAND_FONTS } from '@/lib/brand';
import { useI18n } from '@/lib/i18n';

export default function VerifyScreen() {
  const { language } = useI18n();
  const es = language === 'es';
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const showError = (message: string) => {
    // Supabase reports these in English; translate the two people actually
    // hit rather than showing raw server text in a Spanish-first app.
    const offline = /network request failed|failed to fetch|fetch failed|timed out|socket/i.test(
      message,
    );
    const badCode = /invalid|expired|token/i.test(message);
    setError(
      offline
        ? es
          ? 'No hay conexión. Revisa tu internet e inténtalo de nuevo.'
          : 'No connection. Check your internet and try again.'
        : badCode
          ? es
            ? 'El código no es válido o ha caducado. Pide uno nuevo.'
            : 'That code is not valid or has expired. Request a new one.'
          : message,
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };
  const verify = async () => {
    if (isVerifying) return;
    // Supabase's OTP length is a project setting (6 by default, 8 on this
    // project). Accept the full 6-8 digit range and let the server validate.
    if (code.trim().length < 6) {
      showError(
        es ? 'Escribe el código que enviamos a tu correo.' : 'Enter the code we sent to your email.',
      );
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      const { error: authError } = await verifyEmailCode(email, code);
      if (authError) {
        showError(authError.message);
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)/onboarding');
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo verificar el código.'
            : 'Could not verify your code.',
      );
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <AppScreen
      keyboard
      action={
        <View style={{ alignItems: 'flex-end' }}>
          <LanguageToggle />
        </View>
      }
    >
      <View style={{ gap: 20, paddingTop: 24, paddingBottom: 12 }}>
        <MailCheck size={48} color={UI.tealDarker} strokeWidth={1.7} />
        <Heading size={38}>{es ? 'Revisa\ntu correo' : 'Check\nyour email'}</Heading>
        <Copy muted>{email}</Copy>
      </View>
      <Panel>
        <TextField isInvalid={Boolean(error)}>
          <Label>{es ? 'Código de acceso' : 'Access code'}</Label>
          <Input
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 8))}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={8}
            placeholder="000000"
            style={{
              fontFamily: BRAND_FONTS.bold,
              fontSize: 28,
              letterSpacing: 8,
              textAlign: 'center',
              minHeight: 72,
              borderRadius: 18,
            }}
            onSubmitEditing={() => void verify()}
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </TextField>
        <Action
          label={isVerifying ? (es ? 'Verificando…' : 'Verifying…') : es ? 'Continuar' : 'Continue'}
          onPress={() => void verify()}
          disabled={isVerifying || code.length < 6}
        />
      </Panel>
      <Action
        ghost
        label={es ? 'Usar otro correo' : 'Use another email'}
        onPress={() => goBackOrReplace('/(auth)')}
        disabled={isVerifying}
      />
    </AppScreen>
  );
}
