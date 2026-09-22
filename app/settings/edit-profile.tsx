import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input, Label, TextArea, TextField, Typography } from 'heroui-native';
import { Stack } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useMvpActions, useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const { data: profile } = useProfile(user?.id);
  const { saveProfile } = useMvpActions();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  useEffect(() => {
    if (profile) {
      setName(profile.display_name);
      setBio(profile.bio);
    }
  }, [profile]);
  const save = () => {
    if (!profile) return;
    void saveProfile.mutateAsync({
      id: profile.id,
      display_name: name.trim(),
      bio: bio.trim(),
      spoken_languages: profile.spoken_languages,
      learning_languages: profile.learning_languages,
      learning_level: profile.learning_level,
      adult_confirmed_at: profile.adult_confirmed_at,
      onboarding_completed_at: profile.onboarding_completed_at,
    });
  };
  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{ headerShown: true, title: language === 'es' ? 'Editar perfil' : 'Edit profile' }}
      />
      <ScrollView contentContainerClassName="gap-5 p-safe-offset-5">
        <TextField>
          <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
          <Input value={name} onChangeText={setName} maxLength={50} />
        </TextField>
        <TextField>
          <Label>Bio</Label>
          <TextArea value={bio} onChangeText={setBio} maxLength={280} />
        </TextField>
        <Button isDisabled={saveProfile.isPending || !name.trim()} onPress={save}>
          <Button.Label>
            {saveProfile.isPending ? '…' : language === 'es' ? 'Guardar' : 'Save'}
          </Button.Label>
        </Button>
        {saveProfile.isSuccess ? (
          <Typography.Paragraph className="text-success">
            {language === 'es' ? 'Perfil guardado.' : 'Profile saved.'}
          </Typography.Paragraph>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
