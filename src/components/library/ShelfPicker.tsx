import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { SHELF_LABELS, SHELVES, type Shelf } from '@/lib/Shelves';

type ShelfPickerProps = {
  value: Shelf;
  onChange: (shelf: Shelf) => void;
  disabled?: boolean;
  /** Shown next to each label, e.g. « À lire · 3 ». */
  counts?: Record<Shelf, number>;
  /** One row that scrolls sideways instead of wrapping onto a second line. */
  scrollable?: boolean;
  /** Padding of the scrolling row, so chips can scroll to the screen edge. */
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ShelfPicker({
  value,
  onChange,
  disabled = false,
  counts,
  scrollable = false,
  contentContainerStyle,
}: ShelfPickerProps) {
  const chips = SHELVES.map((shelf) => {
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
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        contentContainerStyle={[styles.scrollRow, contentContainerStyle]}>
        {chips}
      </ScrollView>
    );
  }

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {chips}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollRow: {
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