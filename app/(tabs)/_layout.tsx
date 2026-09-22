import { CalendarDays, Home, Languages, MessageCircle, UserRound } from 'lucide-react-native';
import { Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';

import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';

export default function TabLayout() {
  const { user, session, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const [background, foreground, border, accent, muted] = useThemeColor([
    'background',
    'foreground',
    'border',
    'accent',
    'muted',
  ]);

  if (!isLoading && !session) return <Redirect href="/(auth)" />;
  if (!isLoading && !profileLoading && session && !profile?.onboarding_completed_at)
    return <Redirect href="/(auth)/onboarding" />;

  return (
    <>
      <StatusBar {...{ style: 'dark' }} />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: { backgroundColor: background, borderTopColor: border },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
          tabBarLabelStyle: { color: foreground },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Eventos',
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: 'Personas',
            tabBarIcon: ({ color, size }) => <Languages color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}
