import { StyleSheet, Text, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { SHELF_LABELS, type Shelf } from '@/lib/Shelves';

/** "• À lire": the shelf of a book already in the library. The parent carries the screen reader text. */
export function ShelfTag({ shelf }: { shelf: Shelf }) {
  return (
    <View style={styles.tag} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.dot} />
      <Text style={styles.label}>{SHELF_LABELS[shelf]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  label: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
