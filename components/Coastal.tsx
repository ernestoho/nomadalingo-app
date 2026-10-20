import type { PropsWithChildren, ReactNode } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Avatar, Button, Card, Chip, PressableFeedback, Typography } from 'heroui-native';
import { ArrowRight, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { BRAND_COLORS as C, BRAND_FONTS as F } from '@/lib/brand';

export const UI = {
  ...C,
  background: '#F5F8F8',
  border: '#D8E4E5',
  muted: '#52697D',
  coralLight: '#FBE9E3',
  goldLight: '#F5EADB',
  danger: '#B63132',
} as const;
export const layout = {
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 22,
    gap: 24,
    paddingBottom: 36,
  },
  screen: { flex: 1, backgroundColor: UI.background },
} satisfies Record<string, ViewStyle>;
export function Heading({
  children,
  size = 30,
  light = false,
  style,
}: PropsWithChildren<{ size?: number; light?: boolean; style?: StyleProp<TextStyle> }>) {
  return (
    <Typography
      accessibilityRole="header"
      style={[
        {
          fontFamily: F.display,
          fontSize: size,
          lineHeight: size * 1.18,
          letterSpacing: -0.7,
          color: light ? C.onDark : C.ink,
        },
        style,
      ]}
    >
      {children}
    </Typography>
  );
}
export function Copy({
  children,
  muted = false,
  light = false,
  bold = false,
  size = 15,
  style,
  lines,
}: PropsWithChildren<{
  muted?: boolean;
  light?: boolean;
  bold?: boolean;
  size?: number;
  style?: StyleProp<TextStyle>;
  lines?: number;
}>) {
  return (
    <Typography
      numberOfLines={lines}
      style={[
        {
          fontFamily: bold ? F.bold : F.body,
          fontSize: size,
          lineHeight: size * 1.55,
          color: light ? (muted ? C.onDarkMuted : C.onDark) : muted ? UI.muted : C.ink,
        },
        style,
      ]}
    >
      {children}
    </Typography>
  );
}
export function ScreenHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4 }}>
      <Heading style={{ flex: 1 }} size={34}>
        {title}
      </Heading>
      {action}
    </View>
  );
}
export function Panel({ children, navy = false }: PropsWithChildren<{ navy?: boolean }>) {
  return (
    <Card
      style={{
        padding: 24,
        gap: 18,
        borderRadius: 28,
        backgroundColor: navy ? C.ink : C.surface,
        borderWidth: 0,
      }}
    >
      {children}
    </Card>
  );
}
export function Action({
  label,
  onPress,
  secondary = false,
  ghost = false,
  danger = false,
  disabled = false,
  icon: Icon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  ghost?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <Button
      onPress={onPress}
      isDisabled={disabled}
      variant={danger ? 'danger' : ghost ? 'ghost' : secondary ? 'secondary' : 'primary'}
      style={{ minHeight: compact ? 44 : 54, borderRadius: 18 }}
    >
      {Icon ? (
        <Icon
          size={20}
          strokeWidth={2}
          color={danger || (!secondary && !ghost) ? C.onDark : C.tealDarker}
        />
      ) : null}
      <Button.Label style={{ fontFamily: F.bold, fontSize: compact ? 14 : 16, flexShrink: 1 }}>
        {label}
      </Button.Label>
    </Button>
  );
}
const avatarColors = [C.tealLight, UI.coralLight, UI.goldLight] as const;
export function ProfileAvatar({
  name,
  id = '',
  size = 60,
}: {
  name: string;
  id?: string;
  size?: number;
}) {
  const index =
    Array.from(id || name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'N';
  return (
    <Avatar
      alt={name || 'Nómada'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColors[index],
      }}
    >
      <Avatar.Fallback style={{ backgroundColor: avatarColors[index] }}>
        <Typography style={{ fontFamily: F.display, color: C.ink, fontSize: size * 0.34 }}>
          {initials}
        </Typography>
      </Avatar.Fallback>
    </Avatar>
  );
}
export function LanguageChips({ values, accent = false }: { values: string[]; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {values.map((value) => (
        <Chip
          key={value}
          variant="soft"
          color={accent ? 'accent' : 'default'}
          style={{ maxWidth: '100%' }}
        >
          <Chip.Label numberOfLines={1} style={{ fontFamily: F.medium }}>
            {value}
          </Chip.Label>
        </Chip>
      ))}
    </View>
  );
}
export function NavigationRow({
  title,
  description,
  icon: Icon,
  onPress,
  danger = false,
  trailing,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  onPress: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ borderRadius: 18 }}
    >
      <View
        style={{
          minHeight: 66,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 14,
          paddingHorizontal: 6,
        }}
      >
        {Icon ? <Icon size={22} strokeWidth={2} color={danger ? UI.danger : C.tealDarker} /> : null}
        <View style={{ flex: 1, gap: 3 }}>
          <Copy bold style={danger ? { color: UI.danger } : undefined}>
            {title}
          </Copy>
          {description ? (
            <Copy muted size={13}>
              {description}
            </Copy>
          ) : null}
        </View>
        {trailing || <ChevronRight size={19} color={UI.muted} strokeWidth={2} />}
      </View>
    </PressableFeedback>
  );
}
export function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Heading size={22} style={{ flex: 1 }}>
        {title}
      </Heading>
      {action && onPress ? (
        <Button size="sm" variant="ghost" onPress={onPress}>
          <Button.Label style={{ fontFamily: F.bold }}>{action}</Button.Label>
          <ArrowRight size={17} color={C.tealDarker} />
        </Button>
      ) : null}
    </View>
  );
}
