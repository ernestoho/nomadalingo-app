import { View } from 'react-native';
import { Action, Copy, Heading, LanguageChips, ProfileAvatar, UI } from '@/components/Coastal';
import type { Profile } from '@/lib/data/mvp';

export function ProfileSummary({
  profile,
  language,
  onEdit,
}: {
  profile: Profile;
  language: 'es' | 'en';
  onEdit?: () => void;
}) {
  const es = language === 'es';
  return (
    <View style={{ gap: 30 }}>
      <View style={{ backgroundColor: UI.ink, borderRadius: 30, padding: 26, gap: 18 }}>
        <ProfileAvatar name={profile.display_name} id={profile.id} size={90} />
        <Heading light size={34}>
          {profile.display_name}
        </Heading>
        {profile.bio ? (
          <Copy light muted size={16}>
            {profile.bio}
          </Copy>
        ) : null}
        {onEdit ? (
          <Action secondary label={es ? 'Editar perfil' : 'Edit profile'} onPress={onEdit} />
        ) : null}
      </View>
      <View style={{ gap: 14 }}>
        <Heading size={22}>{es ? 'Habla' : 'Speaks'}</Heading>
        <LanguageChips values={profile.spoken_languages} />
      </View>
      <View style={{ gap: 14 }}>
        <Heading size={22}>{es ? 'Practica' : 'Practices'}</Heading>
        <LanguageChips accent values={profile.learning_languages} />
      </View>
    </View>
  );
}
