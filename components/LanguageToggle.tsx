import { Button } from 'heroui-native';

import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  return (
    <Button size="sm" variant="ghost" onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}>
      <Button.Label>{language === 'es' ? 'EN' : 'ES'}</Button.Label>
    </Button>
  );
}
