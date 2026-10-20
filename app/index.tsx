import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native';
import { ChevronRight, Globe } from 'lucide-react-native';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Path, Svg } from '@/components/ui/primitives/Svg';
import { BRAND_COLORS, BRAND_FONTS } from '@/lib/brand';

const SPLASH_COLORS = {
  sky: '#075D9E',
  pin: '#27DECE',
  location: '#8FE5F4',
  underline: '#FFE334',
  white: BRAND_COLORS.onDark,
  ink: BRAND_COLORS.ink,
} as const;

function SplashPin({ size }: { size: number }) {
  return (
    <Svg width={size * 0.7} height={size} viewBox="0 0 48 68">
      <Path
        d="M24 1C10.8 1 1 11.5 1 25c0 15 23 41.5 23 41.5S47 40 47 25C47 11.5 37.2 1 24 1Z"
        fill={SPLASH_COLORS.pin}
      />
    </Svg>
  );
}

export default function EntryScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 402, height / 820, 1.5);
  const titleSize = 45 * scale;

  return (
    <View style={{ flex: 1, backgroundColor: SPLASH_COLORS.sky }}>
      {/* oxlint-disable-next-line react/style-prop-object -- Expo StatusBar uses a string enum, not a view style object. */}
      <StatusBar style="light" />
      <Image
        source={require('@/assets/images/splash-beach-background.png')}
        accessible={false}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingTop: insets.top + 48 * scale,
          paddingBottom: Math.max(insets.bottom, 20) + 12,
          paddingHorizontal: 22 * scale,
          minHeight: height,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <SplashPin size={72 * scale} />
          <View style={{ marginTop: 4 * scale }}>
            <Text
              accessibilityRole="header"
              maxFontSizeMultiplier={1.2}
              style={{
                fontFamily: BRAND_FONTS.heavy,
                fontSize: titleSize,
                lineHeight: titleSize * 1.2,
                letterSpacing: -1.8 * scale,
                color: SPLASH_COLORS.white,
              }}
            >
              NómadaLingo
            </Text>
          </View>
          <Text
            maxFontSizeMultiplier={1.2}
            style={{
              fontFamily: BRAND_FONTS.bold,
              fontSize: 36 * scale,
              lineHeight: 42 * scale,
              color: SPLASH_COLORS.location,
              letterSpacing: -1 * scale,
            }}
          >
            Punta Cana
          </Text>
          <View
            style={{
              marginTop: 24 * scale,
              alignItems: 'center',
              transform: [{ rotate: '-9deg' }],
            }}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              style={{
                fontFamily: 'KaushanScript_400Regular',
                fontSize: 35 * scale,
                lineHeight: 44 * scale,
                color: SPLASH_COLORS.white,
                textAlign: 'center',
              }}
            >
              {'Tu comunidad\nte espera'}
            </Text>
            <Svg width={186 * scale} height={22 * scale} viewBox="0 0 186 22">
              <Path
                d="M4 15C51 7 108 4 178 8L182 12C119 9 58 14 7 20L0 18Z"
                fill={SPLASH_COLORS.underline}
              />
            </Svg>
          </View>
        </View>
        <Button
          onPress={() => router.replace('/(auth)')}
          accessibilityLabel="Cualquier idioma"
          accessibilityHint="Continuar al inicio de sesión"
          className="rounded-full"
          style={{
            marginTop: 40,
            minHeight: Math.max(60, 72 * scale),
            paddingHorizontal: 20 * scale,
            backgroundColor: SPLASH_COLORS.white,
            gap: 12 * scale,
          }}
        >
          <Globe size={34 * scale} color={SPLASH_COLORS.ink} strokeWidth={2} />
          <Button.Label
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
            style={{
              flexShrink: 1,
              fontFamily: BRAND_FONTS.bold,
              fontSize: 22 * scale,
              color: SPLASH_COLORS.ink,
            }}
          >
            Cualquier idioma
          </Button.Label>
          <ChevronRight size={28 * scale} color={SPLASH_COLORS.ink} strokeWidth={2} />
        </Button>
      </ScrollView>
    </View>
  );
}
