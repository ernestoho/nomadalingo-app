import { CalendarDays, Home, Languages, MessageCircle, UserRound } from 'lucide-react-native';
import { Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';

import * as Haptics from 'expo-haptics';
import { BRAND_FONTS } from '@/lib/brand';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/data/mvp';

export default function TabLayout() {
  const { language } = useI18n();
  const es = language === 'es';
  const { user, session, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(user?.id);
  const [background, border, accent, muted] = useThemeColor([
    'background',
    'border',
    'accent',
    'muted',
  ]);

  if (!isLoading && !session) return <Redirect href="/(auth)" />;
  if (
    !isLoading &&
    !profileLoading &&
    !profileError &&
    session &&
    !profile?.onboarding_completed_at
  )
    return <Redirect href="/(auth)/onboarding" />;

  return (
    <>
      <StatusBar {...{ style: 'dark' }} />
      <Tabs
        screenListeners={({ navigation, route }) => ({
          tabPress: () => {
            const state = navigation.getState();
            if (state.routes[state.index]?.key !== route.key) void Haptics.selectionAsync();
          },
        })}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopColor: border,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
          tabBarLabelStyle: { fontFamily: BRAND_FONTS.bold, fontSize: 11, marginBottom: 3 },
          tabBarItemStyle: { paddingTop: 5 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: es ? 'Inicio' : 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: es ? 'Eventos' : 'Events',
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: es ? 'Personas' : 'People',
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
            title: es ? 'Perfil' : 'Profile',
            tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}
