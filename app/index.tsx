import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';

export default function EntryScreen() {
  const { isLoading, user } = useAuth();
  const profile = useProfile(user?.id);

  if (isLoading || (user && profile.isLoading)) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <StateView loading message="Preparando NómadaLingo…" />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)" />;
  if (!profile.data?.onboarding_completed_at) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
