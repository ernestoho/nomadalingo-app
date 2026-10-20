import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from 'heroui-native';

import { BRAND_COLORS, BRAND_FONTS } from '@/lib/brand';
import { useI18n } from '@/lib/i18n';

export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <Button
      size="sm"
      variant={onDark ? 'outline' : 'ghost'}
      className={onDark ? 'min-w-16 rounded-full border-white/40 bg-black/10' : undefined}
      onPress={() => {
        void Haptics.selectionAsync();
        setLanguage(language === 'es' ? 'en' : 'es');
      }}
      accessibilityLabel={
        language === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'
      }
    >
      <Button.Label style={[styles.label, onDark && styles.labelOnDark]}>
        {language === 'es' ? 'ES / EN' : 'EN / ES'}
      </Button.Label>
    </Button>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: BRAND_FONTS.bold,
    fontSize: 12,
  },
  labelOnDark: {
    color: BRAND_COLORS.onDark,
  },
});
