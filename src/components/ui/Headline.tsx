import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

type HeadlineProps = {
  /** The title, with the words to write by hand between asterisks: `On reprend *la lecture* ?`. */
  children: string;
  /** Size of the display typeface, the handwriting follows. */
  size?: number;
  /** White and cream instead of ink and brown, over the camera. */
  onDark?: boolean;
  style?: StyleProp<TextStyle>;
};

/**
 * Large page title in two voices: the display typeface, and the words between
 * asterisks handwritten in brown.
 */
export function Headline({ children, size = 34, onDark = false, style }: HeadlineProps) {
  // Odd pieces are the ones that were between two asterisks
  const pieces = children.split('*');

  return (
    <Text
      // The line height leaves room for the handwriting, which stands taller than the display face
      style={[styles.headline, { fontSize: size, lineHeight: size * 1.35 }, onDark && styles.onDark, style]}
      accessibilityRole="header">
      {pieces.map((piece, index) =>
        index % 2 === 1 ? (
          // Larger than the words around it: Caveat is drawn small for its size
          <Text key={index} style={[styles.script, { fontSize: size * 1.3 }, onDark && styles.scriptOnDark]}>
            {piece}
          </Text>
        ) : (
          piece
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  headline: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontWeight: '700',
    letterSpacing: -1.3,
  },
  onDark: {
    color: Palette.inkInverse,
  },
  script: {
    color: Palette.accentStrong,
    fontFamily: Fonts.script,
    fontWeight: '700',
    letterSpacing: 0,
  },
  scriptOnDark: {
    color: Palette.accentSoft,
  },
});
