import { SymbolView } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette, Space } from '@/constants/theme';

/** Titled card of settings rows separated by thin rules (Figma frame 20). */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      {title && <SectionTitle>{title}</SectionTitle>}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/** Section heading, the same as on the home tab. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {children}
    </Text>
  );
}

type SettingsRowProps = {
  label: string;
  value?: string;
  /** Greyed placeholder shown in place of an empty value, e.g. « Ajouter ». */
  placeholder?: string;
  onPress?: () => void;
  accessibilityHint?: string;
};

/** One row: label on the left, value and a chevron on the right when it opens something. */
export function SettingsRow({ label, value, placeholder, onPress, accessibilityHint }: SettingsRowProps) {
  const shown = value || placeholder;
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.trailing}>
        {shown ? (
          <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1} ellipsizeMode="middle">
            {shown}
          </Text>
        ) : null}
        {onPress && (
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={16}
            tintColor={Palette.inkSecondary}
          />
        )}
      </View>
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Space.block,
  },
  sectionTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  card: {
    paddingHorizontal: Space.card,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 54,
  },
  pressed: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.line,
  },
  label: {
    color: Palette.ink,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  trailing: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    flexShrink: 1,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  placeholder: {
    color: Palette.accentStrong,
  },
});
