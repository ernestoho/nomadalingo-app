import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Button, FieldError, Input, Label, TextField } from 'heroui-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Mail } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import welcomeBackground from '@/assets/images/auth-beach.png';
import { LanguageToggle } from '@/components/LanguageToggle';
import { NomadaLingoWordmark } from '@/components/NomadaLingoLogo';
import { Action, Copy, Heading, UI, layout } from '@/components/Coastal';
import { BRAND_FONTS } from '@/lib/brand';
import { requestEmailCode } from '@/lib/auth-actions';
import { signInWithApple } from '@/lib/social-auth';
import { useI18n } from '@/lib/i18n';

type EntryMode = 'signup' | 'signin' | null;
export default function SignInScreen() {
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const wide = width >= 900;
  const [mode, setMode] = useState<EntryMode>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'apple' | null>(null);
  const showError = (message: string) => {
    setError(message);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };
  const submit = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await requestEmailCode(email);
      if (result.error) {
        showError(result.error.message);
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } });
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo enviar el código.'
            : 'Could not send your code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const submitApple = async () => {
    setError('');
    setSocialProvider('apple');
    try {
      const completed = await signInWithApple();
      if (completed) router.replace('/');
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo iniciar sesión.'
            : 'Could not sign in.',
      );
    } finally {
      setSocialProvider(null);
    }
  };
  const choose = (value: EntryMode) => {
    setMode(value);
    setError('');
    void Haptics.selectionAsync();
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: UI.ink }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Expo StatusBar uses a string style enum, not a React Native style object. */}
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, flexDirection: wide ? 'row' : 'column' }}
      >
        <ImageBackground
          source={welcomeBackground}
          resizeMode="cover"
          imageStyle={{ width: '100%', height: '100%' }}
          style={{
            width: wide ? '55%' : '100%',
            height: 'auto',
            minHeight: wide ? height : mode ? 270 : 400,
            flexGrow: wide ? 0 : 1,
          }}
        >
          <View
            style={{ position: 'absolute', inset: 0, backgroundColor: UI.ink, opacity: 0.55 }}
          />
          <View
            style={[
              layout.content,
              {
                flex: 1,
                justifyContent: 'space-between',
                paddingTop: insets.top + 20,
                gap: 60,
                paddingBottom: 32,
              },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <NomadaLingoWordmark
                size={24}
                tint={UI.onDark}
                pinFill={UI.tealLight}
                style={{ flexShrink: 1 }}
              />
              <LanguageToggle onDark />
            </View>
            <View style={{ gap: 16 }}>
              <Heading size={wide ? 54 : mode ? 34 : width < 360 ? 38 : 46} light>
                {es ? 'Dos idiomas.\nUn coro.' : 'Two languages.\nOne community.'}
              </Heading>
              <Copy light size={17}>
                {es
                  ? 'Gente real. Conversaciones en Punta Cana.'
                  : 'Real people. Conversations in Punta Cana.'}
              </Copy>
            </View>
          </View>
        </ImageBackground>
        <View
          style={{
            backgroundColor: UI.background,
            borderTopLeftRadius: wide ? 0 : 32,
            borderTopRightRadius: wide ? 0 : 32,
            marginTop: wide ? 0 : -16,
            flex: wide ? 1 : undefined,
            justifyContent: wide ? 'center' : undefined,
          }}
        >
          <Animated.View
            key={mode || 'welcome'}
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(100)}
            style={[
              layout.content,
              {
                maxWidth: wide ? 440 : 760,
                paddingTop: 30,
                paddingBottom: insets.bottom + 26,
                gap: 18,
              },
            ]}
          >
            <Heading size={27}>
              {mode
                ? mode === 'signup'
                  ? es
                    ? 'Crea tu cuenta'
                    : 'Create your account'
                  : es
                    ? 'Qué bueno verte'
                    : 'Welcome back'
                : es
                  ? 'Tu comunidad te espera'
                  : 'Find your community'}
            </Heading>
            {mode ? (
              <>
                <TextField isInvalid={Boolean(error)}>
                  <Label>{es ? 'Correo electrónico' : 'Email address'}</Label>
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder={es ? 'tu@correo.com' : 'you@email.com'}
                    value={email}
                    onChangeText={setEmail}
                    style={{ minHeight: 56, borderRadius: 16, fontFamily: BRAND_FONTS.body }}
                    onSubmitEditing={() => void submit()}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </TextField>
                <Action
                  label={
                    isSubmitting
                      ? es
                        ? 'Enviando…'
                        : 'Sending…'
                      : es
                        ? 'Recibir código'
                        : 'Send code'
                  }
                  icon={Mail}
                  disabled={isSubmitting || !email.trim()}
                  onPress={() => void submit()}
                />
                <Action
                  ghost
                  label={es ? 'Volver' : 'Back'}
                  onPress={() => choose(null)}
                  disabled={isSubmitting}
                />
              </>
            ) : (
              <>
                <Action
                  label={es ? 'Crear cuenta' : 'Create account'}
                  icon={ArrowRight}
                  onPress={() => choose('signup')}
                />
                <Action
                  secondary
                  label={es ? 'Ya tengo cuenta' : 'I have an account'}
                  disabled={Boolean(socialProvider)}
                  onPress={() => choose('signin')}
                />
                {Platform.OS === 'ios' ? (
                  <Button
                    variant="outline"
                    isDisabled={Boolean(socialProvider)}
                    onPress={() => void submitApple()}
                    style={{ minHeight: 54, borderRadius: 18 }}
                  >
                    <Button.Label style={{ fontFamily: BRAND_FONTS.bold }}>
                      {socialProvider
                        ? es
                          ? 'Conectando…'
                          : 'Connecting…'
                        : es
                          ? 'Continuar con Apple'
                          : 'Continue with Apple'}
                    </Button.Label>
                  </Button>
                ) : null}
                {error ? <FieldError>{error}</FieldError> : null}
              </>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
