import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

export type DecorCover = {
  title: string;
  author: string;
  color: string;
  ink: string;
  titleSize: number;
  width: number;
  uppercase?: boolean;
  /** Side the text hugs; `right` for a cover whose left part is hidden behind another one. */
  align?: 'left' | 'right';
};

// Drawn as typographic covers: the mockup's illustrated covers are sample art, not app assets
/** Flat book cover for illustrations, laid out at a 2:3 ratio from its width. */
export function DecorCoverView({ cover, style }: { cover: DecorCover; style?: StyleProp<ViewStyle> }) {
  const { width } = cover;
  const scale = width / 96;

  return (
    <View
      style={[
        styles.cover,
        {
          width,
          height: width * 1.5,
          padding: 11 * scale,
          borderTopRightRadius: 2.88 * scale,
          borderBottomRightRadius: 2.88 * scale,
          backgroundColor: cover.color,
        },
        style,
      ]}>
      <Text
        style={[
          styles.title,
          cover.uppercase && styles.titleUppercase,
          cover.align === 'right' && styles.right,
          // Space Grotesk needs about 1.15: tighter, iOS cuts the top of capitals and accents
          { color: cover.ink, fontSize: cover.titleSize, lineHeight: cover.titleSize * 1.15 },
        ]}>
        {cover.title}
      </Text>
      <Text
        style={[
          styles.author,
          cover.align === 'right' && styles.right,
          { color: cover.ink, fontSize: 5 * scale, letterSpacing: 0.5 * scale },
        ]}>
        {cover.author}
      </Text>
      <View style={[styles.hinge, { width: 7.68 * scale }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    gap: 2,
    borderTopLeftRadius: 1.44,
    borderBottomLeftRadius: 1.44,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.12) 100%)',
  },
  title: {
    fontFamily: Fonts.display,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  right: {
    textAlign: 'right',
  },
  titleUppercase: {
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  author: {
    opacity: 0.85,
    fontFamily: Fonts.body,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  hinge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 1.44,
    borderBottomLeftRadius: 1.44,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(255, 255, 255, 0.18) 62%, rgba(255, 255, 255, 0) 100%)',
  },
});
