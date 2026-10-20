import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PressableFeedback } from 'heroui-native';
import { useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';

const ARTWORK_WIDTH = 560;
const ARTWORK_HEIGHT = 1230;
const launchArtwork = require('@/assets/images/launch-splash.png');

export default function EntryScreen() {
  const window = useWindowDimensions();
  const [layout, setLayout] = useState({ width: window.width, height: window.height });
  const scale = Math.min(layout.width / ARTWORK_WIDTH, layout.height / ARTWORK_HEIGHT);
  const width = ARTWORK_WIDTH * scale;
  const height = ARTWORK_HEIGHT * scale;

  return (
    <View
      className="flex-1 items-center justify-center bg-black"
      onLayout={({ nativeEvent }) => {
        const { width: nextWidth, height: nextHeight } = nativeEvent.layout;
        setLayout({ width: nextWidth, height: nextHeight });
      }}
    >
      <StatusBar hidden />
      <View style={{ width, height }}>
        <Image
          source={launchArtwork}
          accessible
          accessibilityLabel="NómadaLingo Punta Cana. Tu comunidad te espera."
          resizeMode="contain"
          style={{ width, height }}
        />
        <PressableFeedback
          accessibilityRole="button"
          accessibilityLabel="Cualquier idioma"
          accessibilityHint="Continuar al inicio de sesión"
          animation="disable-all"
          onPress={() => router.replace('/(auth)')}
          style={{
            position: 'absolute',
            left: 46 * scale,
            top: 1088 * scale,
            width: 478 * scale,
            height: 106 * scale,
            borderRadius: 53 * scale,
          }}
        >
          <View className="flex-1" />
        </PressableFeedback>
      </View>
    </View>
  );
}
