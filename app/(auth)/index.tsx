import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Button, FieldError, Input, Label, TextField, Typography } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import welcomeBackground from '@/assets/images/auth-beach.png';
import { LanguageToggle } from '@/components/LanguageToggle';
import { NomadaLingoWordmark } from '@/components/NomadaLingoLogo';
import { BRAND_COLORS, BRAND_FONTS } from '@/lib/brand';
import { requestEmailCode } from '@/lib/auth-actions';
import { signInWithApple, signInWithGoogle } from '@/lib/social-auth';
import { useI18n } from '@/lib/i18n';

type EntryMode = 'signup' | 'signin' | null;
type SocialProvider = 'apple' | 'google';

const COPY = {
  es: {
    headline: 'Practica un idioma con gente real en Punta Cana.',
    tagline: 'Dos idiomas. Un coro.',
    stats: [
      ['2', 'idiomas'],
      ['1', 'comunidad'],
      ['0', 'presión'],
    ],
    create: 'Crear cuenta',
    signIn: 'Ya tengo cuenta',
    signupTitle: 'Crea tu cuenta',
    signinTitle: 'Inicia sesión',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    send: 'Continuar',
    sending: 'Enviando…',
    google: 'Continuar con Google',
    apple: 'Continuar con Apple',
    connecting: 'Conectando…',
    back: 'Volver',
  },
  en: {
    headline: 'Practice a language with real people in Punta Cana.',
    tagline: 'Two languages. One community.',
    stats: [
      ['2', 'languages'],
      ['1', 'community'],
      ['0', 'pressure'],
    ],
    create: 'Create account',
    signIn: 'I have an account',
    signupTitle: 'Create your account',
    signinTitle: 'Sign in',
    email: 'Email address',
    emailPlaceholder: 'you@email.com',
    send: 'Continue',
    sending: 'Sending…',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    connecting: 'Connecting…',
    back: 'Back',
  },
} as const;

export default function SignInScreen() {
  const { language } = useI18n();
  const copy = COPY[language];
  const [mode, setMode] = useState<EntryMode>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);

  const submit = async () => {
    setError('');
    setIsSubmitting(true);
    const result = await requestEmailCode(email);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } });
  };

  const submitSocial = async (provider: SocialProvider) => {
    setError('');
    setSocialProvider(provider);
    try {
      const completed = provider === 'apple' ? await signInWithApple() : await signInWithGoogle();
      if (completed) router.replace('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesión.');
    } finally {
      setSocialProvider(null);
    }
  };

  return (
    <ImageBackground
      source={welcomeBackground}
      resizeMode="cover"
      style={{ flex: 1, width: '100%', height: '100%' }}
      accessibilityIgnoresInvertColors
    >
      <StatusBar {...{ style: 'light' }} />
      <LinearGradient
        pointerEvents="none"
        colors={[BRAND_COLORS.overlayTop, BRAND_COLORS.overlayMiddle, BRAND_COLORS.overlayBottom]}
        locations={[0, 0.42, 1]}
        className="absolute inset-0"
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="min-h-full flex-grow justify-between px-4 pb-safe-offset-5 pt-safe-offset-4"
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className="flex-row items-center justify-between gap-4">
            <NomadaLingoWordmark
              size={30}
              tint={BRAND_COLORS.onDark}
              pinFill={BRAND_COLORS.tealLight}
              pinEye={BRAND_COLORS.ink}
              style={styles.wordmark}
            />
            <LanguageToggle onDark />
          </View>

          <View className="gap-7 pt-32">
            <View className="gap-3">
              <Typography.Heading
                className="web:text-4xl max-w-xl text-3xl leading-tight text-white"
                style={styles.hero}
                type="h1"
              >
                {copy.headline}
              </Typography.Heading>
              <Typography style={styles.tagline}>{copy.tagline}</Typography>
            </View>

            <View className="flex-row items-start gap-5 pl-4">
              {copy.stats.map(([value, label], index) => (
                <View key={label} className="flex-row items-center gap-5">
                  {index > 0 ? <View className="size-1 rounded-full bg-white/40" /> : null}
                  <View className="items-center">
                    <Typography style={styles.statValue}>{value}</Typography>
                    <Typography style={styles.statLabel}>{label}</Typography>
                  </View>
                </View>
              ))}
            </View>

            {mode ? (
              <View className="gap-4 rounded-3xl border p-5" style={styles.formPanel}>
                <Typography.Heading style={styles.formTitle} type="h3">
                  {mode === 'signup' ? copy.signupTitle : copy.signinTitle}
                </Typography.Heading>
                <TextField>
                  <Label>
                    <Label.Text style={styles.fieldLabel}>{copy.email}</Label.Text>
                  </Label>
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                  />
                </TextField>
                {error ? <FieldError>{error}</FieldError> : null}
                <Button
                  className="h-14"
                  style={styles.primaryButton}
                  isDisabled={isSubmitting || !email.trim()}
                  onPress={() => void submit()}
                >
                  <Button.Label style={styles.primaryButtonLabel}>
                    {isSubmitting ? copy.sending : copy.send}
                  </Button.Label>
                </Button>
                <Button variant="ghost" onPress={() => setMode(null)}>
                  <Button.Label style={styles.ghostButtonLabel}>{copy.back}</Button.Label>
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                <Button
                  className="h-14 rounded-2xl"
                  style={styles.primaryButton}
                  onPress={() => setMode('signup')}
                >
                  <Button.Label style={styles.primaryButtonLabel}>{copy.create}</Button.Label>
                </Button>
                <Button
                  className="h-14 rounded-2xl border border-white/40 bg-white/5"
                  variant="outline"
                  isDisabled={Boolean(socialProvider)}
                  onPress={() => setMode('signin')}
                >
                  <Button.Label style={styles.secondaryButtonLabel}>{copy.signIn}</Button.Label>
                </Button>
                {Platform.OS !== 'web' ? (
                  <Button
                    className="h-14 rounded-2xl border border-white/40 bg-white/5"
                    variant="outline"
                    isDisabled={Boolean(socialProvider)}
                    onPress={() => void submitSocial('google')}
                  >
                    <Button.Label style={styles.secondaryButtonLabel}>
                      {socialProvider === 'google' ? copy.connecting : copy.google}
                    </Button.Label>
                  </Button>
                ) : null}
                {Platform.OS === 'ios' ? (
                  <Button
                    className="h-14 rounded-2xl border border-white/40 bg-white/5"
                    variant="outline"
                    isDisabled={Boolean(socialProvider)}
                    onPress={() => void submitSocial('apple')}
                  >
                    <Button.Label style={styles.secondaryButtonLabel}>
                      {socialProvider === 'apple' ? copy.connecting : copy.apple}
                    </Button.Label>
                  </Button>
                ) : null}
                {error ? <FieldError>{error}</FieldError> : null}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    flexShrink: 1,
  },
  hero: {
    fontFamily: BRAND_FONTS.display,
    color: BRAND_COLORS.onDark,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: BRAND_FONTS.bold,
    fontSize: 16,
    lineHeight: 22,
    color: BRAND_COLORS.gold,
  },
  statValue: {
    fontFamily: BRAND_FONTS.heavy,
    fontSize: 20,
    lineHeight: 25,
    color: BRAND_COLORS.onDark,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: BRAND_FONTS.medium,
    fontSize: 12,
    lineHeight: 17,
    color: BRAND_COLORS.onDarkMuted,
  },
  formPanel: {
    backgroundColor: BRAND_COLORS.panel,
    borderColor: BRAND_COLORS.panelBorder,
  },
  formTitle: {
    fontFamily: BRAND_FONTS.display,
    fontSize: 21,
    lineHeight: 25,
    color: BRAND_COLORS.onDark,
  },
  fieldLabel: {
    fontFamily: BRAND_FONTS.medium,
    color: BRAND_COLORS.onDarkMuted,
  },
  primaryButton: {
    backgroundColor: BRAND_COLORS.tealDarker,
  },
  primaryButtonLabel: {
    fontFamily: BRAND_FONTS.bold,
    fontSize: 16,
    color: BRAND_COLORS.onDark,
  },
  secondaryButtonLabel: {
    fontFamily: BRAND_FONTS.bold,
    fontSize: 16,
    color: BRAND_COLORS.onDark,
  },
  ghostButtonLabel: {
    fontFamily: BRAND_FONTS.medium,
    color: BRAND_COLORS.onDark,
  },
});
