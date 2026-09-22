import { Button } from 'heroui-native';

import { useI18n } from '@/lib/i18n';

export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <Button
      size="sm"
      variant={onDark ? 'outline' : 'ghost'}
      className={onDark ? 'min-w-16 rounded-full border-white/40 bg-black/10' : undefined}
      onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}
      accessibilityLabel={
        language === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'
      }
    >
      <Button.Label className={onDark ? 'text-xs font-bold text-white' : undefined}>
        {language === 'es' ? 'ES / EN' : 'EN / ES'}
      </Button.Label>
    </Button>
  );
}
