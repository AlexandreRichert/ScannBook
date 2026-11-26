import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

type DecorSpine = {
  title: string;
  width: number;
  height: number;
  color: string;
  ink: string;
  fontSize: 10 | 12;
  fontWeight: '500' | '700';
};

// Purely decorative row of the Figma « Rayon », not tied to the user's library
const SPINES: DecorSpine[] = [
  { title: 'La Horde du Contrevent', width: 40, height: 104, color: '#1D3140', ink: '#E6EEF1', fontSize: 12, fontWeight: '500' },
  { title: 'Sapiens', width: 24, height: 84, color: '#EADBC0', ink: '#2B2118', fontSize: 10, fontWeight: '700' },
  { title: 'Les Misérables', width: 44, height: 108, color: '#6E1F26', ink: '#F7E8DC', fontSize: 12, fontWeight: '500' },
  { title: 'L’Étranger', width: 20, height: 78, color: '#D9A860', ink: '#22344A', fontSize: 10, fontWeight: '700' },
  { title: 'La Peste', width: 30, height: 96, color: '#1F3550', ink: '#F1E9D6', fontSize: 12, fontWeight: '700' },
  { title: 'Dune', width: 38, height: 102, color: Palette.accent, ink: Palette.ink, fontSize: 12, fontWeight: '700' },
  { title: 'Noces', width: 22, height: 82, color: Palette.ink, ink: '#F4F1EA', fontSize: 10, fontWeight: '500' },
  { title: 'Germinal', width: 34, height: 98, color: '#7C9A6A', ink: '#F6F3E4', fontSize: 12, fontWeight: '700' },
  { title: 'Candide', width: 18, height: 74, color: '#D9A814', ink: '#1A1608', fontSize: 10, fontWeight: '500' },
  { title: '1984', width: 28, height: 92, color: '#F4F1EA', ink: Palette.ink, fontSize: 10, fontWeight: '700' },
  { title: 'Bel-Ami', width: 32, height: 100, color: '#A3462A', ink: '#F8ECD9', fontSize: 12, fontWeight: '700' },
];

const SPINE_PADDING = 8;
const FILET_THICKNESS = 2;
const FILET_GAP = 5;

/** Shelf of book spines standing at the bottom of the auth screens. */
export function AuthShelf({ plank = true }: { plank?: boolean }) {
  return (
    <View style={styles.shelf} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.row}>
        {SPINES.map((spine) => (
          <SpineView key={spine.title} spine={spine} />
        ))}
      </View>
      {plank && <View style={styles.plank} />}
    </View>
  );
}

function SpineView({ spine }: { spine: DecorSpine }) {
  const filet = [styles.filet, { width: spine.width - SPINE_PADDING, backgroundColor: spine.ink }];
  // The title box is laid out horizontally then turned, so its length is the spine height
  const length = spine.height - 2 * (SPINE_PADDING + FILET_THICKNESS + FILET_GAP);

  return (
    <View style={[styles.spine, { width: spine.width, height: spine.height, backgroundColor: spine.color }]}>
      <View style={filet} />
      <View style={styles.titleSlot}>
        <View
          style={[
            styles.titleBox,
            { width: length, height: spine.width, left: (spine.width - length) / 2, top: (length - spine.width) / 2 },
          ]}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: spine.ink, fontSize: spine.fontSize, fontWeight: spine.fontWeight }]}>
            {spine.title}
          </Text>
        </View>
      </View>
      <View style={filet} />
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  spine: {
    alignItems: 'center',
    paddingVertical: SPINE_PADDING,
    gap: FILET_GAP,
    borderRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 20%, rgba(0, 0, 0, 0.05) 65%, rgba(0, 0, 0, 0.36) 100%)',
  },
  filet: {
    height: FILET_THICKNESS,
    opacity: 0.55,
  },
  titleSlot: {
    flex: 1,
    alignSelf: 'stretch',
  },
  titleBox: {
    position: 'absolute',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  title: {
    fontFamily: Fonts.display,
  },
  plank: {
    height: 8,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 30%, rgba(0, 0, 0, 0.2) 100%)',
  },
});
