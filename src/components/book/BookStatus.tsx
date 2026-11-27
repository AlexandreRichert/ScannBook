import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import type { GoogleBooksError } from '@/hooks/useBookByIsbn';
import { bookLookupErrorMessage, bookLookupErrorTitle } from '@/lib/BookLookupMessages';

type SymbolName = SymbolViewProps['name'];

// Decorative spines of the Figma « Livre introuvable » illustration, the gap marks the missing book
const SPINES = [
  { color: '#2F4560', height: 88 },
  { color: '#D9A814', height: 74 },
  { color: '#B5532E', height: 100 },
  null,
  { color: '#7C9A6A', height: 68 },
  { color: '#2B3B4E', height: 84 },
  { color: '#7A2A30', height: 96 },
];

type BookStatusProps = {
  icon: SymbolName;
  tone?: 'neutral' | 'error';
  title: string;
  children?: ReactNode;
  /** One or more `StatusButton`. */
  actions: ReactNode;
};

/** Illustrated message for a lookup that did not give a book (Figma frames 13 and 14). */
export function BookStatus({ icon, tone = 'neutral', title, children, actions }: BookStatusProps) {
  const isError = tone === 'error';

  return (
    <View style={styles.container}>
      <View style={styles.illustration} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={styles.halo} />
        <View style={styles.spines}>
          {SPINES.map((spine, index) =>
            spine ? (
              <View key={index} style={[styles.spine, { backgroundColor: spine.color, height: spine.height }]} />
            ) : (
              <View key={index} style={styles.missing}>
                <Text style={styles.question}>?</Text>
              </View>
            ),
          )}
        </View>
        <View style={styles.shelf} />
        <View style={styles.badge}>
          <SymbolView name={icon} size={28} tintColor={isError ? Palette.danger : Palette.ink} />
        </View>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children}
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

/** Centered secondary text of a `BookStatus`; nest `<StatusText strong>` to emphasize a part. */
export function StatusText({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <Text style={[styles.body, strong && styles.strong]}>{children}</Text>;
}

/** A failed Google Books call, with a retry button. */
export function LookupErrorStatus({ error, onRetry }: { error: GoogleBooksError; onRetry: () => void }) {
  return (
    <BookStatus
      icon={
        error.kind === 'network'
          ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
          : { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }
      }
      tone="error"
      title={bookLookupErrorTitle(error)}
      actions={
        <StatusButton
          label="Réessayer"
          icon={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
          onPress={onRetry}
        />
      }>
      <StatusText>{bookLookupErrorMessage(error)}</StatusText>
    </BookStatus>
  );
}

type StatusButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: SymbolName;
};

export function StatusButton({ label, onPress, variant = 'primary', icon }: StatusButtonProps) {
  const isPrimary = variant === 'primary';
  const color = isPrimary ? Palette.inkInverse : Palette.ink;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]}>
      {icon && <SymbolView name={icon} size={16} tintColor={color} />}
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  illustration: {
    width: 234,
    height: 200,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 28,
  },
  halo: {
    position: 'absolute',
    top: 8,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: Palette.paperSunken,
  },
  spines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  spine: {
    width: 20,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(0, 0, 0, 0.34) 100%)',
  },
  missing: {
    width: 24,
    height: 96,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.lineStrong,
    borderRadius: 2,
  },
  question: {
    marginTop: -28,
    color: Palette.inkTertiary,
    fontFamily: Fonts.display,
    fontSize: 20,
    fontWeight: '700',
  },
  shelf: {
    alignSelf: 'stretch',
    height: 9,
    backgroundColor: Palette.wood,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paperRaised,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  strong: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  primary: {
    backgroundColor: Palette.accentStrong,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  secondary: {
    backgroundColor: Palette.paperRaised,
    borderColor: Palette.lineStrong,
    borderWidth: 1,
  },
  buttonLabel: {
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
});
