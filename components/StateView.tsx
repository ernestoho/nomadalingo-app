import { Button, Spinner, Typography } from 'heroui-native';
import { View } from 'react-native';

export function StateView({
  loading,
  message,
  actionLabel,
  onAction,
}: {
  loading?: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="bg-surface items-center gap-4 rounded-3xl p-8">
      {loading ? <Spinner size="lg" color="success" /> : null}
      <Typography.Paragraph align="center" color="muted">
        {message}
      </Typography.Paragraph>
      {actionLabel && onAction ? (
        <Button size="sm" variant="ghost" onPress={onAction}>
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
