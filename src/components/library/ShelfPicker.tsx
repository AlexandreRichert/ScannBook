import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { SHELF_LABELS, SHELVES, type Shelf } from '@/lib/Shelves';

type ShelfPickerProps = {
  value: Shelf;
  onChange: (shelf: Shelf) => void;
  disabled?: boolean;
    /** Shown next to each label, e.g. « À lire · 3 ». */
  counts?: Record<Shelf, number>;
};

export function ShelfPicker({ value, onChange, disabled = false, counts }: ShelfPickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {SHELVES.map((shelf) => {
        const selected = shelf === value;
        return (
          <Pressable
            key={shelf}
            onPress={() => onChange(shelf)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {counts ? `${SHELF_LABELS[shelf]} · ${counts[shelf]}` : SHELF_LABELS[shelf]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    justifyContent: 'center',
  },
  selected: {
    borderColor: C.primary,
    backgroundColor: C.primary,
  },
  label: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedLabel: {
    color: C.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});