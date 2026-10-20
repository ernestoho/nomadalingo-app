import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Input, PressableFeedback } from 'heroui-native';
import { ArrowUpRight, Search, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Copy,
  Heading,
  LanguageChips,
  ProfileAvatar,
  ScreenHeading,
  UI,
  layout,
} from '@/components/Coastal';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { usePeople } from '@/lib/data/mvp';
import { useI18n } from '@/lib/i18n';
import { BRAND_FONTS } from '@/lib/brand';
import { useRefreshOnFocus } from '@/lib/useRefreshOnFocus';

export default function PeopleScreen() {
  const { user } = useAuth();
  const { language } = useI18n();
  const es = language === 'es';
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, isRefetching, error, refetch } = usePeople(user?.id);
  const [search, setSearch] = useState('');
  useRefreshOnFocus(refetch);
  const people = useMemo(
    () =>
      data.filter(
        (profile) =>
          profile.id !== user?.id &&
          `${profile.display_name} ${profile.spoken_languages.join(' ')} ${profile.learning_languages.join(' ')}`
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
      ),
    [data, user?.id, search],
  );
  return (
    <FlatList
      style={layout.screen}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        layout.content,
        { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 32 },
      ]}
      data={error ? [] : people}
      keyExtractor={(item) => item.id}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListHeaderComponent={
        <View style={{ gap: 22, paddingBottom: 24 }}>
          <ScreenHeading title={es ? 'Tu próximo\n“hola”.' : 'Your next\n“hello”.'} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 18,
              backgroundColor: UI.surface,
              paddingLeft: 16,
            }}
          >
            <Search color={UI.muted} size={20} />
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder={es ? 'Buscar nombre o idioma' : 'Search name or language'}
              accessibilityLabel={es ? 'Buscar personas' : 'Search people'}
              style={{
                flex: 1,
                minHeight: 56,
                borderWidth: 0,
                borderRadius: 18,
                fontFamily: BRAND_FONTS.body,
              }}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <StateView
          icon={Users}
          loading={isLoading}
          error={Boolean(error)}
          message={
            error?.message ||
            (search
              ? es
                ? 'No encontramos coincidencias.'
                : 'No matches found.'
              : es
                ? 'Aquí conocerás a personas para practicar.'
                : 'Meet people to practice with here.')
          }
          actionLabel={
            error
              ? es
                ? 'Reintentar'
                : 'Retry'
              : search
                ? es
                  ? 'Limpiar búsqueda'
                  : 'Clear search'
                : es
                  ? 'Actualizar'
                  : 'Refresh'
          }
          onAction={() => (error ? void refetch() : search ? setSearch('') : void refetch())}
        />
      }
      renderItem={({ item }) => (
        <PressableFeedback
          style={{ borderRadius: 26 }}
          accessibilityRole="button"
          accessibilityLabel={
            es ? `Ver perfil de ${item.display_name}` : `View ${item.display_name}'s profile`
          }
          onPress={() => router.push({ pathname: '/person/[id]', params: { id: item.id } })}
        >
          <View style={{ borderRadius: 26, backgroundColor: UI.surface, padding: 22, gap: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <ProfileAvatar name={item.display_name} id={item.id} size={68} />
              <Heading size={23} style={{ flex: 1 }}>
                {item.display_name}
              </Heading>
              <ArrowUpRight color={UI.tealDarker} size={21} />
            </View>
            {item.bio ? (
              <Copy muted lines={3}>
                {item.bio}
              </Copy>
            ) : null}
            <View style={{ gap: 9 }}>
              <Copy muted bold size={12}>
                {es ? 'Practica' : 'Practices'}
              </Copy>
              <LanguageChips accent values={item.learning_languages} />
            </View>
          </View>
        </PressableFeedback>
      )}
    />
  );
}
