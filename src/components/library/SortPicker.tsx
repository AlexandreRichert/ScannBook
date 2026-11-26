import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { LIBRARY_SORT_LABELS, LIBRARY_SORTS, type LibrarySort } from '@/lib/LibrarySort';

type SortPickerProps = {
  value: LibrarySort;
  onChange: (sort: LibrarySort) => void;
};

export function SortPicker({ value, onChange }: SortPickerProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.caption}>Trier par</Text>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Trier par">
        {LIBRARY_SORTS.map((sort) => {
          const selected = sort === value;
          return (
            <Pressable
              key={sort}
              onPress={() => onChange(sort)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={6}
              style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}>
              <Text style={[styles.label, selected && styles.selectedLabel]}>{LIBRARY_SORT_LABELS[sort]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  caption: {
    color: C.textSecondary,
    fontSize: 14,
  },
  options: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: C.coverPlaceholder,
  },
  label: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLabel: {
    color: C.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});