import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { FieldError, Input, Label, TextArea, TextField } from 'heroui-native';
import { Check, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { Action, Copy, Heading, ProfileAvatar, UI } from '@/components/Coastal';
import { RouteHeader } from '@/components/RouteHeader';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useMvpActions, useProfile } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { BRAND_FONTS } from '@/lib/brand';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const { data: profile, isLoading, error: loadError, refetch } = useProfile(user?.id);
  const { saveProfile } = useMvpActions();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (profile) {
      setName(profile.display_name);
      setBio(profile.bio);
    }
  }, [profile]);
  const save = async () => {
    if (!profile || !name.trim() || saveProfile.isPending) return;
    setError('');
    setSaved(false);
    try {
      await saveProfile.mutateAsync({
        id: profile.id,
        display_name: name.trim(),
        bio: bio.trim(),
        spoken_languages: profile.spoken_languages,
        learning_languages: profile.learning_languages,
        learning_level: profile.learning_level,
        adult_confirmed_at: profile.adult_confirmed_at,
        onboarding_completed_at: profile.onboarding_completed_at,
      });
      setSaved(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : es
            ? 'No se pudo guardar tu perfil.'
            : 'Could not save your profile.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  return (
    <AppScreen keyboard topInset={false}>
      <RouteHeader
        title={es ? 'Editar perfil' : 'Edit profile'}
        fallback="/(tabs)/profile"
        fallbackLabel={es ? 'Tu perfil' : 'Your profile'}
      />
      {isLoading || loadError || !profile ? (
        <StateView
          loading={isLoading}
          error={Boolean(loadError)}
          message={
            loadError?.message ||
            (es ? 'No se pudo cargar tu perfil.' : 'Could not load your profile.')
          }
          actionLabel={es ? 'Reintentar' : 'Retry'}
          onAction={() => void refetch()}
        />
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 18, paddingVertical: 12 }}>
            <ProfileAvatar name={name || 'Nómada'} id={profile.id} size={96} />
            <Heading size={28}>{es ? 'Así te conocerán.' : 'Make an introduction.'}</Heading>
          </View>
          <TextField>
            <Label>{es ? 'Nombre' : 'Name'}</Label>
            <Input
              value={name}
              onChangeText={(value) => {
                setName(value);
                setSaved(false);
              }}
              maxLength={50}
              style={{ minHeight: 56, borderRadius: 16, fontFamily: BRAND_FONTS.body }}
            />
          </TextField>
          <TextField>
            <Label>Bio</Label>
            <TextArea
              value={bio}
              onChangeText={(value) => {
                setBio(value);
                setSaved(false);
              }}
              maxLength={280}
              style={{ minHeight: 150, borderRadius: 18, fontFamily: BRAND_FONTS.body }}
            />
            <Copy muted size={12} style={{ textAlign: 'right' }}>
              {bio.length}/280
            </Copy>
          </TextField>
          {error ? <FieldError>{error}</FieldError> : null}
          <Action
            icon={Save}
            disabled={saveProfile.isPending || !name.trim()}
            label={
              saveProfile.isPending
                ? es
                  ? 'Guardando…'
                  : 'Saving…'
                : es
                  ? 'Guardar cambios'
                  : 'Save changes'
            }
            onPress={() => void save()}
          />
          {saved ? (
            <View
              accessibilityLiveRegion="polite"
              style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Check size={20} color={UI.tealDarker} />
              <Copy bold>{es ? 'Perfil guardado.' : 'Profile saved.'}</Copy>
            </View>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}
