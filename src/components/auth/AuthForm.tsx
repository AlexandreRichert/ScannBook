import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type AuthFormProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  error: string | null;
  submitLabel: string;
  canSubmit: boolean;
  onSubmit: () => void;
  footer?: ReactNode;
}>;

export function AuthForm({
  title,
  subtitle,
  error,
  submitLabel,
  canSubmit,
  onSubmit,
  footer,
  children,
}: AuthFormProps) {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title">{title}</ThemedText>
            {subtitle && <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>}
            {children}
            {error && (
              <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                {error}
              </ThemedText>
            )}
            <Button label={submitLabel} onPress={onSubmit} disabled={!canSubmit} fullWidth />
            {footer}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});