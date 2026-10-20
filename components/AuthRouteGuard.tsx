import { Redirect, useSegments } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';

const PRIVATE_ROUTE_ROOTS = new Set(['(tabs)', 'chat', 'event', 'person', 'settings']);

export function AuthRouteGuard({ children }: PropsWithChildren) {
  const segments = useSegments();
  const { isLoading, user } = useAuth();
  const profile = useProfile(user?.id);
  const rootSegment = segments[0];
  const isPrivateRoute = PRIVATE_ROUTE_ROOTS.has(rootSegment);
  const isOnboarding = rootSegment === '(auth)' && segments[1] === 'onboarding';
  const isPublicAuthRoute = rootSegment === '(auth)' && !isOnboarding;
  const needsProfile = Boolean(user && (isPrivateRoute || isOnboarding || isPublicAuthRoute));

  // The launch screen is public and remains visible until its continue button is pressed.
  if (!rootSegment) return children;

  if (isLoading || (needsProfile && profile.isLoading)) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <StateView loading message="Preparando NómadaLingo…" />
      </View>
    );
  }

  if ((isPrivateRoute || isOnboarding) && !user) return <Redirect href="/(auth)" />;

  if (isPrivateRoute && !profile.data?.onboarding_completed_at) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (isOnboarding && profile.data?.onboarding_completed_at) {
    return <Redirect href="/(tabs)" />;
  }

  if (isPublicAuthRoute && user) {
    return (
      <Redirect href={profile.data?.onboarding_completed_at ? '/(tabs)' : '/(auth)/onboarding'} />
    );
  }

  return children;
}
