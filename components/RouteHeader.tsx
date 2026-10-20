import { Link, router, Stack, type Href } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { BRAND_FONTS } from '@/lib/brand';

export function RouteHeader({
  title,
  fallback,
  fallbackLabel,
}: {
  title: string;
  fallback: Href;
  fallbackLabel: string;
}) {
  const [background, foreground, accent] = useThemeColor(['background', 'foreground', 'accent']);
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title,
          headerStyle: { backgroundColor: background },
          headerTintColor: foreground,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: BRAND_FONTS.bold, fontSize: 17 },
          contentStyle: { backgroundColor: background },
        }}
      />
      {!router.canGoBack() ? (
        <Link
          replace
          href={fallback}
          style={{ color: accent, fontFamily: BRAND_FONTS.bold, fontSize: 15, paddingVertical: 10 }}
        >
          {fallbackLabel}
        </Link>
      ) : null}
    </>
  );
}
