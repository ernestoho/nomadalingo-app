import { useEffect } from 'react';
import { View } from 'react-native';
import { Skeleton } from 'heroui-native';
import { MessageCircle, RefreshCw, type LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Action, Copy, UI } from '@/components/Coastal';

export function StateView({
  loading,
  message,
  actionLabel,
  onAction,
  error = false,
  icon: Icon = MessageCircle,
}: {
  loading?: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  error?: boolean;
  icon?: LucideIcon;
}) {
  useEffect(() => {
    if (error) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [error, message]);
  if (loading)
    return (
      <View style={{ gap: 16, width: '100%' }} accessibilityLabel={message}>
        {[0, 1, 2].map((key) => (
          <View key={key} className="bg-surface gap-4 rounded-3xl p-6">
            <Skeleton className="h-6 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </View>
        ))}
      </View>
    );
  const StateIcon = error ? RefreshCw : Icon;
  return (
    <View style={{ alignItems: 'center', gap: 18, paddingVertical: 38, paddingHorizontal: 20 }}>
      <StateIcon size={36} strokeWidth={1.8} color={UI.tealDarker} />
      <Copy muted style={{ textAlign: 'center' }}>
        {message}
      </Copy>
      {actionLabel && onAction ? (
        <Action secondary compact label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
