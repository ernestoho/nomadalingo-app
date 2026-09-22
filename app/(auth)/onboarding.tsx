import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, FieldError, Input, Label, TextArea, TextField, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

const LANGUAGES = ['Español', 'English', 'Français', 'Português'];

function toggleChoice(values: string[], setValues: (values: string[]) => void, value: string) {
  setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
}

function ChoiceRow({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {LANGUAGES.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={selected.includes(item) ? 'primary' : 'secondary'}
          onPress={() => onToggle(item)}
        >
          <Button.Label>{item}</Button.Label>
        </Button>
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const { language } = useI18n();
  const { user } = useAuth();
  const { saveProfile } = useMvpActions();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [spoken, setSpoken] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!user || !name.trim() || spoken.length === 0 || learning.length === 0 || !adult) {
      setError(
        language === 'es'
          ? 'Completa tu nombre, idiomas y confirmación de edad.'
          : 'Complete your name, languages, and age confirmation.',
      );
      return;
    }
    const now = new Date().toISOString();
    try {
      await saveProfile.mutateAsync({
        id: user.id,
        display_name: name.trim(),
        spoken_languages: spoken,
        learning_languages: learning,
        learning_level: 'beginner',
        bio: bio.trim(),
        adult_confirmed_at: now,
        onboarding_completed_at: now,
      });
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar tu perfil.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-6 p-safe-offset-6"
        keyboardShouldPersistTaps="handled"
      >
        <Typography.Heading type="h2">
          {language === 'es' ? 'Crea tu perfil' : 'Create your profile'}
        </Typography.Heading>
        <TextField>
          <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
          <Input value={name} onChangeText={setName} maxLength={50} />
        </TextField>
        <View className="gap-3">
          <Label>{language === 'es' ? 'Idiomas que hablas' : 'Languages you speak'}</Label>
          <ChoiceRow
            selected={spoken}
            onToggle={(value) => toggleChoice(spoken, setSpoken, value)}
          />
        </View>
        <View className="gap-3">
          <Label>{language === 'es' ? 'Idiomas que practicas' : 'Languages you practice'}</Label>
          <ChoiceRow
            selected={learning}
            onToggle={(value) => toggleChoice(learning, setLearning, value)}
          />
        </View>
        <TextField>
          <Label>Bio</Label>
          <TextArea value={bio} onChangeText={setBio} maxLength={280} />
        </TextField>
        <Button variant={adult ? 'primary' : 'secondary'} onPress={() => setAdult(!adult)}>
          <Button.Label>
            {adult ? '✓ ' : ''}
            {language === 'es' ? 'Confirmo que tengo 18 años o más' : 'I confirm I am 18 or older'}
          </Button.Label>
        </Button>
        {error ? <FieldError>{error}</FieldError> : null}
        <Button onPress={() => void submit()} isDisabled={saveProfile.isPending}>
          <Button.Label>
            {saveProfile.isPending
              ? 'Guardando…'
              : language === 'es'
                ? 'Entrar a NómadaLingo'
                : 'Enter NómadaLingo'}
          </Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
