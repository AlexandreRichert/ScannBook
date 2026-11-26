import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

type AuthLinkProps = {
  label: string;
  tone?: 'strong' | 'subtle';
} & ({ href: Href; onPress?: never } | { href?: never; onPress: () => void });

export function AuthLink({ label, tone = 'strong', href, onPress }: AuthLinkProps) {
  const style = [styles.link, tone === 'subtle' && styles.subtle];
  if (href) {
    return (
      <Link href={href} style={style}>
        {label}
      </Link>
    );
  }
  return (
    <Text style={style} onPress={onPress} accessibilityRole="link">
      {label}
    </Text>
  );
}

/** « Pas encore de compte ? Créer un compte » line under the main button. */
export function AuthPrompt({ question, children }: { question: string; children: ReactNode }) {
  return (
    <View style={styles.prompt}>
      <Text style={styles.question}>{question}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // The vertical padding only widens the touch target, the line height stays the mockup one
  link: {
    paddingVertical: 4,
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
    textDecorationLine: 'underline',
  },
  subtle: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0,
  },
  prompt: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 6,
  },
  question: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});
