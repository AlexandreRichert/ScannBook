import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHero } from '@/components/auth/AuthHero';
import { AuthShelf } from '@/components/auth/AuthShelf';
import { FieldError } from '@/components/ui/TextField';
import { Fonts, Palette } from '@/constants/theme';

const FORM_MAX_WIDTH = 480;

type AuthFormProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  error: string | null;
  submitLabel: string;
  canSubmit: boolean;
  onSubmit: () => void;
  footer?: ReactNode;
  /** Shows the title in the brown header of the sign-in screen instead of above the form. */
  hero?: boolean;
  back?: { label: string; onPress: () => void };
  /** Stable id of the submit button for end-to-end tests (Maestro). */
  submitTestID?: string;
}>;

export function AuthForm({
  title,
  subtitle,
  error,
  submitLabel,
  canSubmit,
  onSubmit,
  footer,
  hero = false,
  back,
  submitTestID,
  children,
}: AuthFormProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={hero ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {hero ? (
          <AuthHero title={title} subtitle={subtitle} />
        ) : (
          <View style={[styles.top, { paddingTop: insets.top + 2 }]}>
            {back ? (
              <Pressable
                onPress={back.onPress}
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                  size={22}
                  tintColor={Palette.ink}
                />
                <Text style={styles.backLabel}>{back.label}</Text>
              </Pressable>
            ) : (
              <View style={styles.backSpacer} />
            )}
          </View>
        )}

        <View
          style={[
            styles.content,
            hero ? [styles.contentUnderHero, { paddingBottom: insets.bottom + 32 }] : styles.contentUnderTitle,
          ]}>
          {!hero && (
            <View style={styles.heading}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          )}
          <View style={styles.form}>
            {children}
            {error ? <FieldError message={error} alert /> : null}
          </View>
          <View style={styles.actions}>
            <AuthButton label={submitLabel} onPress={onSubmit} disabled={!canSubmit} testID={submitTestID} />
            {footer}
          </View>
        </View>

        {!hero && (
          <View style={styles.shelf}>
            <AuthShelf />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  scroll: {
    flexGrow: 1,
  },
  top: {
    paddingHorizontal: 14,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    height: 40,
  },
  backSpacer: {
    height: 40,
  },
  backLabel: {
    color: Palette.ink,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  contentUnderHero: {
    gap: 20,
    marginTop: 28,
  },
  contentUnderTitle: {
    gap: 22,
    marginTop: 16,
  },
  heading: {
    gap: 6,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  subtitle: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  form: {
    gap: 12,
  },
  actions: {
    alignItems: 'center',
    gap: 14,
  },
  // Pushed to the bottom of the screen, it scrolls away with the form on short screens
  shelf: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
  },
});
