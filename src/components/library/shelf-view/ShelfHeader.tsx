import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SortPicker } from '@/components/library/SortPicker';
import { Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import type { LibrarySort } from '@/lib/LibrarySort';
import { SHELF_LABELS, type Shelf } from '@/lib/Shelves';

import { SHELF_PADDING } from './ShelfRows';

type ShelfHeaderProps = {
  shelf: Shelf;
  /** Left out while the library loads, which hides the count and the sort. */
  counts?: Record<Shelf, number>;
  sort: LibrarySort;
  onSortChange: (sort: LibrarySort) => void;
  style?: StyleProp<ViewStyle>;
};

/** Shelf name with its book count and the sort pill (Figma frame 16). */
export function ShelfHeader({ shelf, counts, sort, onSortChange, style }: ShelfHeaderProps) {
  const count = counts?.[shelf];

  return (
    <View style={[styles.header, style]}>
      <View style={styles.titleRow}>
        <View style={styles.titles}>
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {SHELF_LABELS[shelf]}
          </Text>
          {count !== undefined && <Text style={styles.count}>{`${count} ${count > 1 ? 'livres' : 'livre'}`}</Text>}
        </View>
        {counts && <SortPicker value={sort} onChange={onSortChange} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: SHELF_PADDING,
    paddingBottom: 20,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titles: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  count: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
});
