import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, ScreenHeading, UI } from '@/components/Coastal';

export function AppScreen({
  title,
  action,
  children,
  refreshing = false,
  onRefresh,
  keyboard = false,
  topInset = true,
}: PropsWithChildren<{
  title?: string;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboard?: boolean;
  topInset?: boolean;
}>) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={layout.screen}
      behavior={keyboard && Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          layout.content,
          { paddingTop: topInset ? insets.top + 22 : 22, paddingBottom: insets.bottom + 32 },
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              tintColor={UI.tealDarker}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
      >
        {title ? (
          <ScreenHeading title={title} action={action} />
        ) : action ? (
          <View>{action}</View>
        ) : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
