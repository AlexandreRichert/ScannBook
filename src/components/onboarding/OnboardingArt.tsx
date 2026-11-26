import { StyleSheet, Text, View } from 'react-native';

import { AuthShelf } from '@/components/auth/AuthShelf';
import { DecorCoverView, type DecorCover } from '@/components/decor/DecorCover';
import { ProgressBar } from '@/components/library/ProgressBar';
import { Fonts, Palette, ShelfColors } from '@/constants/theme';
import type { Shelf } from '@/lib/Shelves';

// Illustrations are laid out on the 390 pt mockup frame, positions measured from the shelf up
export const ART_WIDTH = 390;

const ETRANGER: DecorCover = { title: 'L’Étranger', author: 'Albert Camus', color: '#D9A860', ink: '#22344A', titleSize: 22, width: 160 };
const SAPIENS: DecorCover = { title: 'Sapiens', author: 'Yuval Noah Harari', color: '#EADBC0', ink: '#2B2118', titleSize: 18, width: 104 };
const HORDE: DecorCover = { title: 'La Horde du Contrevent', author: 'Alain Damasio', color: '#1D3140', ink: '#E6EEF1', titleSize: 15, width: 140, uppercase: true };
const MISERABLES: DecorCover = { title: 'Les Misérables', author: 'Victor Hugo', color: '#6E1F26', ink: '#F7E8DC', titleSize: 15, width: 108 };

// Bar widths of a made-up EAN-13, only there to read as a barcode
const BARS = [2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 2, 1, 1, 3, 1, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3];

/** Step 1: a book and its barcode label caught in the scanner frame. */
export function ScanArt() {
  return (
    <>
      <View style={[styles.book, { left: 50, bottom: 0 }]}>
        <View style={styles.bookSpine} />
        <DecorCoverView cover={ETRANGER} />
      </View>
      <View style={styles.viewfinder}>
        {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((corner) => (
          <View key={corner} style={[styles.corner, styles[corner]]} />
        ))}
      </View>
      <View style={styles.label}>
        <Text style={styles.isbn}>ISBN 978-2-07-036002-4</Text>
        <View style={styles.bars}>
          {BARS.map((width, index) => (
            <View key={index} style={{ width, backgroundColor: index % 2 === 0 ? Palette.ink : 'transparent' }} />
          ))}
        </View>
        <Text style={styles.ean}>9 782070 360024</Text>
      </View>
    </>
  );
}

const PILLS: { shelf: Shelf; label: string; left: number; bottom: number; rotate: string }[] = [
  { shelf: 'to_read', label: 'À lire', left: 32, bottom: 258, rotate: '6deg' },
  { shelf: 'reading', label: 'En cours', left: 146, bottom: 300, rotate: '-5deg' },
  { shelf: 'read', label: 'Lu', left: 286, bottom: 250, rotate: '5deg' },
];

/** Step 2: a full shelf with the pile names floating above it. */
export function ShelvesArt() {
  return (
    <>
      <View style={styles.shelfRow}>
        <AuthShelf plank={false} />
      </View>
      {PILLS.map((pill) => (
        <View
          key={pill.shelf}
          style={[styles.pill, { left: pill.left, bottom: pill.bottom, transform: [{ rotate: pill.rotate }] }]}>
          <View style={[styles.dot, { backgroundColor: ShelfColors[pill.shelf] }]} />
          <Text style={styles.pillLabel}>{pill.label}</Text>
        </View>
      ))}
    </>
  );
}

/** Step 3: books being read and the progress of one of them. */
export function ProgressArt() {
  return (
    <>
      <DecorCoverView cover={SAPIENS} style={[styles.placed, { left: 10, bottom: 0, transform: [{ rotate: '-7deg' }] }]} />
      <DecorCoverView cover={MISERABLES} style={[styles.placed, { left: 274, bottom: 0, transform: [{ rotate: '5deg' }] }]} />
      <View style={[styles.book, { left: 118, bottom: 0, transform: [] }]}>
        <View style={[styles.bookSpine, { backgroundColor: '#152430' }]} />
        <DecorCoverView cover={HORDE} />
      </View>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressPages}>page 312 sur 704</Text>
          <Text style={styles.progressPercent}>44 %</Text>
        </View>
        <ProgressBar ratio={312 / 704} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  placed: {
    position: 'absolute',
  },
  book: {
    position: 'absolute',
    flexDirection: 'row',
    transform: [{ rotate: '-3deg' }],
  },
  bookSpine: {
    width: 14,
    marginRight: -1,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    backgroundColor: '#B98C45',
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0%, rgba(255, 255, 255, 0.18) 45%, rgba(0, 0, 0, 0.2) 100%)',
  },
  viewfinder: {
    position: 'absolute',
    left: 162,
    bottom: 144,
    width: 216,
    height: 150,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Palette.inkInverse,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  label: {
    position: 'absolute',
    left: 180,
    bottom: 178,
    width: 178,
    gap: 4,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    transform: [{ rotate: '7deg' }],
  },
  isbn: {
    color: Palette.ink,
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 12,
  },
  bars: {
    flexDirection: 'row',
    height: 26,
  },
  ean: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  shelfRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Palette.paperRaised,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pillLabel: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  progressCard: {
    position: 'absolute',
    left: 174,
    bottom: 284,
    width: 176,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    transform: [{ rotate: '5deg' }],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressPages: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  progressPercent: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
