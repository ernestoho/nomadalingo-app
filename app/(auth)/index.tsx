import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, FieldError, Input, Label, TextField, Typography } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import welcomeBackground from '@/assets/images/auth-beach.png';
import { LanguageToggle } from '@/components/LanguageToggle';
import { requestEmailCode } from '@/lib/auth-actions';
import { useI18n } from '@/lib/i18n';

type EntryMode = 'signup' | 'signin' | null;

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
        colors={['rgba(5,15,24,0.12)', 'rgba(5,15,24,0.05)', 'rgba(5,15,24,0.94)']}
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
          <View className="flex-row items-center justify-between">
            <Typography.Heading
              className="text-3xl font-extrabold tracking-tight text-white"
              type="h2"
            >
              NómadaLingo
            </Typography.Heading>
            <LanguageToggle onDark />
          </View>

          <View className="gap-7 pt-32">
            <View className="gap-3">
              <Typography.Heading
                className="web:text-4xl max-w-xl text-3xl leading-tight font-extrabold tracking-tight text-white"
                type="h1"
              >
                {copy.headline}
              </Typography.Heading>
              <Typography className="text-base font-semibold text-amber-200">
                {copy.tagline}
              </Typography>
            </View>

            <View className="flex-row items-start gap-5 pl-4">
              {copy.stats.map(([value, label], index) => (
                <View key={label} className="flex-row items-center gap-5">
                  {index > 0 ? <View className="size-1 rounded-full bg-white/40" /> : null}
                  <View className="items-center">
                    <Typography className="text-xl font-extrabold text-white">{value}</Typography>
                    <Typography className="text-xs font-semibold text-white/70">{label}</Typography>
                  </View>
                </View>
              ))}
            </View>

            {mode ? (
              <View className="gap-4 rounded-3xl border border-white/20 bg-slate-950/75 p-5">
                <Typography.Heading className="text-xl font-bold text-white" type="h3">
                  {mode === 'signup' ? copy.signupTitle : copy.signinTitle}
                </Typography.Heading>
                <TextField>
                  <Label className="text-white/80">{copy.email}</Label>
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
                  className="h-14 bg-teal-500"
                  isDisabled={isSubmitting || !email.trim()}
                  onPress={() => void submit()}
                >
                  <Button.Label className="font-bold text-white">
                    {isSubmitting ? copy.sending : copy.send}
                  </Button.Label>
                </Button>
                <Button variant="ghost" onPress={() => setMode(null)}>
                  <Button.Label className="font-semibold text-white">{copy.back}</Button.Label>
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                <Button className="h-14 rounded-2xl bg-teal-500" onPress={() => setMode('signup')}>
                  <Button.Label className="text-base font-bold text-white">
                    {copy.create}
                  </Button.Label>
                </Button>
                <Button
                  className="h-14 rounded-2xl border border-white/40 bg-white/5"
                  variant="outline"
                  onPress={() => setMode('signin')}
                >
                  <Button.Label className="text-base font-bold text-white">
                    {copy.signIn}
                  </Button.Label>
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
