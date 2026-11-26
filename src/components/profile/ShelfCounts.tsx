import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/profile/SettingsGroup';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, ShelfColors } from '@/constants/theme';
import type { Shelf } from '@/lib/Shelves';

const COUNTED: { shelf: Shelf; one: string; many: string }[] = [
  { shelf: 'reading', one: 'en cours', many: 'en cours' },
  { shelf: 'to_read', one: 'à lire', many: 'à lire' },
  { shelf: 'wishlist', one: 'envie', many: 'envies' },
];

type ShelfCountsProps = {
  counts: Record<Shelf, number>;
  onOpenShelf: (shelf: Shelf) => void;
};

/** One card split in three: the books on the shelves still in progress, each opening its shelf. */
export function ShelfCounts({ counts, onOpenShelf }: ShelfCountsProps) {
  return (
    <View style={styles.section}>
      <SectionTitle>En ce moment</SectionTitle>
      <View style={styles.card}>
        {COUNTED.map(({ shelf, one, many }, index) => {
          const count = counts[shelf];
          const label = count > 1 ? many : one;
          return (
            <Fragment key={shelf}>
              {index > 0 && <View style={styles.rule} />}
              <PressableScale
                onPress={() => onOpenShelf(shelf)}
                accessibilityRole="button"
                accessibilityLabel={`${count} ${label}`}
                style={styles.cell}>
                <Text style={styles.value} numberOfLines={1}>
                  {count.toLocaleString('fr-FR')}
                </Text>
                <View style={styles.caption}>
                  <View style={[styles.dot, { backgroundColor: ShelfColors[shelf] }]} />
                  <Text style={styles.label} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              </PressableScale>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  rule: {
    width: 1,
    backgroundColor: Palette.line,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 16,
  },
  value: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    flexShrink: 1,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
});
