import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

const SCRIPT_SCALE = 1.2;

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
  // Larger than the words around it: Caveat is drawn small for its size
  const scriptSize = size * SCRIPT_SCALE;
  // iOS cuts whatever is drawn outside a line or outside the text box. The line is sized for
  // the handwriting, the tallest of the two faces, and the padding gives its loops and tails
  // room above the first line and below the last one. The negative margins take that room
  // back, so the title sits where it would without it.
  const lineHeight = Math.round(scriptSize * 1.3);
  const above = Math.round(size * 0.15);
  const below = Math.round(size * 0.3);

  return (
    <Text
      style={[
        styles.headline,
        { fontSize: size, lineHeight, paddingTop: above, paddingBottom: below, marginTop: -above, marginBottom: -below },
        onDark && styles.onDark,
        style,
      ]}
      accessibilityRole="header">
      {pieces.map((piece, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={[styles.script, { fontSize: scriptSize }, onDark && styles.scriptOnDark]}>
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
