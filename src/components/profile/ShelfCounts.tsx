import { StyleSheet, View } from 'react-native';

import { HomeStats, type ShelfStat } from '@/components/home/HomeStats';
import { SectionTitle } from '@/components/profile/SettingsGroup';
import { Space } from '@/constants/theme';
import type { Shelf } from '@/lib/Shelves';

const COUNTED: ShelfStat[] = [
  { shelf: 'reading', one: 'En cours', many: 'En cours' },
  { shelf: 'to_read', one: 'À lire', many: 'À lire' },
  { shelf: 'wishlist', one: 'Wishlist', many: 'Wishlist' },
];

type ShelfCountsProps = {
  counts: Record<Shelf, number>;
  onOpenShelf: (shelf: Shelf) => void;
};

/** The piles still in progress, as the same row of figures as on the home tab, each opening its pile. */
export function ShelfCounts({ counts, onOpenShelf }: ShelfCountsProps) {
  return (
    <View style={styles.section}>
      <SectionTitle>En ce moment</SectionTitle>
      <HomeStats counts={counts} onOpenShelf={onOpenShelf} stats={COUNTED} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Space.block,
  },
});
