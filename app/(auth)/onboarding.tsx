import { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { AppScreen } from '@/components/AppScreen';
import { Heading, ProfileAvatar, UI } from '@/components/Coastal';
import { BRAND_FONTS } from '@/lib/brand';
import { Button, FieldError, Input, Label, TextArea, TextField } from 'heroui-native';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useMvpActions } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

const LANGUAGES = ['Español', 'English', 'Français', 'Português'];

function toggleChoice(values: string[], setValues: (values: string[]) => void, value: string) {
  void Haptics.selectionAsync();
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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (caught) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar tu perfil.');
    }
  };

  return (
    <AppScreen keyboard>
      <View style={{ gap: 20, paddingTop: 12 }}>
        <ProfileAvatar name={name || 'Nómada'} size={80} />
        <Heading size={38}>
          {language === 'es' ? 'Dale voz\na tu perfil' : 'Make your\nprofile yours'}
        </Heading>
      </View>
      <TextField>
        <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
        <Input
          style={{ minHeight: 56, borderRadius: 16, fontFamily: BRAND_FONTS.body }}
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
      </TextField>
      <View className="gap-3">
        <Label>{language === 'es' ? 'Idiomas que hablas' : 'Languages you speak'}</Label>
        <ChoiceRow selected={spoken} onToggle={(value) => toggleChoice(spoken, setSpoken, value)} />
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
      <Button
        variant={adult ? 'primary' : 'secondary'}
        style={{ minHeight: 60, borderRadius: 18 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: adult }}
        onPress={() => {
          void Haptics.selectionAsync();
          setAdult(!adult);
        }}
      >
        {adult ? <Check size={20} color={UI.onDark} /> : null}
        <Button.Label style={{ flexShrink: 1, fontFamily: BRAND_FONTS.medium, fontSize: 14 }}>
          {language === 'es' ? 'Confirmo que tengo 18 años o más' : 'I confirm I am 18 or older'}
        </Button.Label>
      </Button>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button
        style={{ minHeight: 56, borderRadius: 18 }}
        onPress={() => void submit()}
        isDisabled={saveProfile.isPending}
      >
        <Button.Label>
          {saveProfile.isPending
            ? 'Guardando…'
            : language === 'es'
              ? 'Entrar a NómadaLingo'
              : 'Enter NómadaLingo'}
        </Button.Label>
      </Button>
    </AppScreen>
  );
}
