import { Dialog } from 'heroui-native';
import { View } from 'react-native';
import { Action } from '@/components/Coastal';
import { BRAND_FONTS } from '@/lib/brand';

export function ConfirmAction({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  pending,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={(value) => {
        if (!value && !pending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-5 rounded-3xl p-6" style={{ width: '90%', maxWidth: 440 }}>
          <Dialog.Title style={{ fontFamily: BRAND_FONTS.display, fontSize: 25 }}>
            {title}
          </Dialog.Title>
          <Dialog.Description
            style={{ fontFamily: BRAND_FONTS.body, fontSize: 15, lineHeight: 24 }}
          >
            {message}
          </Dialog.Description>
          <View style={{ gap: 10 }}>
            <Action danger label={confirmLabel} disabled={pending} onPress={onConfirm} />
            <Action secondary label={cancelLabel} disabled={pending} onPress={onClose} />
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
