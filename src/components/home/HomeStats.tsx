import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, Space } from '@/constants/theme';
import type { Shelf } from '@/lib/Shelves';

export type ShelfStat = { shelf: Shelf; one: string; many: string };

const READING_STATS: ShelfStat[] = [
  { shelf: 'reading', one: 'En cours', many: 'En cours' },
  { shelf: 'to_read', one: 'À lire', many: 'À lire' },
  { shelf: 'read', one: 'Lu', many: 'Lus' },
];

type HomeStatsProps = {
  /** Null while the library loads. */
  counts: Record<Shelf, number> | null;
  onOpenShelf: (shelf: Shelf) => void;
  /** Which piles to count; by default what is being read, waiting and read. */
  stats?: readonly ShelfStat[];
};

/** Three figures between two hairlines, each opening its pile. */
export function HomeStats({ counts, onOpenShelf, stats = READING_STATS }: HomeStatsProps) {
  return (
    <View style={styles.row}>
      {stats.map(({ shelf, one, many }, index) => {
        const count = counts?.[shelf];
        const label = count !== undefined && count > 1 ? many : one;
        return (
          <Fragment key={shelf}>
            {index > 0 && <View style={styles.rule} />}
            <PressableScale
              onPress={() => onOpenShelf(shelf)}
              accessibilityRole="button"
              accessibilityLabel={count === undefined ? label : `${count} ${label}`}
              style={styles.stat}>
              <Text style={styles.value}>{count ?? '–'}</Text>
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            </PressableScale>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Palette.line,
  },
  rule: {
    width: 1,
    marginVertical: Space.block,
    backgroundColor: Palette.line,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space.block,
  },
  value: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  label: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
});
