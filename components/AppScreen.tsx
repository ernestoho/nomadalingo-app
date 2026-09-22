import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Typography } from 'heroui-native';

export function AppScreen({
  title,
  action,
  children,
  refreshing = false,
  onRefresh,
}: PropsWithChildren<{
  title: string;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}>) {
  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-safe-offset-8 pt-safe-offset-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        <View className="flex-row items-center justify-between gap-4">
          <Typography.Heading type="h2" className="flex-1">
            {title}
          </Typography.Heading>
          {action}
        </View>
        {children}
      </ScrollView>
    </View>
  );
}
