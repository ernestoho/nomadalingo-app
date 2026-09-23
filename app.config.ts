import type { ConfigContext, ExpoConfig } from '@expo/config';

import { ensureNativeBrandAssets } from './scripts/generate-native-brand-assets.ts';

const BRAND_ASSET_ROOT = './assets/images/native-brand';
const BRAND_COLORS = {
  sand: '#FDF8F1',
} as const;

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  ensureNativeBrandAssets(process.cwd());

  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }]]
      : [];

  return {
    ...config,
    name: 'NómadaLingo',
    slug: 'nomadalingo',
    version: process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    icon: `${BRAND_ASSET_ROOT}/icon.png`,
    userInterfaceStyle: 'light',
    scheme: 'nomadalingo',
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      usesAppleSignIn: true,
      config: {
        usesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: process.env.BILT_IOS_BUNDLE_ID ?? 'com.nomadalingo.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: BRAND_COLORS.sand,
        foregroundImage: `${BRAND_ASSET_ROOT}/adaptive-foreground.png`,
        monochromeImage: `${BRAND_ASSET_ROOT}/adaptive-monochrome.png`,
      },
      package: process.env.BILT_ANDROID_PACKAGE ?? 'com.nomadalingo.app',
    },
    web: {
      bundler: 'metro',
      // 'single' = SPA export: one index.html + client routing, so edge serving
      // needs only a single 404→index.html fallback rule.
      output: 'single',
      favicon: './public/icons/icon-192.png',
    },
    extra: {
      appStoreAppId: process.env.BILT_APP_STORE_APP_ID,
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: BRAND_COLORS.sand,
          image: `${BRAND_ASSET_ROOT}/splash.png`,
          imageWidth: 190,
          resizeMode: 'contain',
        },
      ],
      'expo-status-bar',
      'expo-font',
      'expo-secure-store',
      'expo-apple-authentication',
      ...nativePlugins,
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
