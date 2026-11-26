import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { GoogleBooksError } from '@/hooks/useBookByIsbn';
import { bookLookupErrorMessage, bookLookupErrorTitle } from '@/lib/BookLookupMessages';

type SymbolName = SymbolViewProps['name'];

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
      <View
        style={[
          styles.illustration,
          { backgroundColor: isError ? C.errorIllustration : C.neutralIllustration },
        ]}>
        <SymbolView name={icon} size={36} tintColor={isError ? C.error : C.textSecondary} />
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
  const color = isPrimary ? C.onPrimary : C.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}>
      {icon && <SymbolView name={icon} size={16} tintColor={color} />}
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  illustration: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: C.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  strong: {
    color: C.text,
    fontWeight: '700',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 35,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: C.primary,
  },
  secondary: {
    backgroundColor: C.surface,
    borderColor: C.primary,
    borderWidth: 1.5,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
