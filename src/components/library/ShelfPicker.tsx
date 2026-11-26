import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, ShelfColors } from '@/constants/theme';
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
      <PressableScale
        haptic
        key={shelf}
        onPress={() => onChange(shelf)}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled }}
        style={[styles.chip, selected && styles.selected]}>
        <View style={[styles.dot, { backgroundColor: ShelfColors[shelf] }]} />
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {counts ? `${SHELF_LABELS[shelf]} · ${counts[shelf]}` : SHELF_LABELS[shelf]}
        </Text>
      </PressableScale>
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
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  selected: {
    borderColor: Palette.ink,
    backgroundColor: Palette.ink,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  selectedLabel: {
    color: Palette.inkInverse,
  },
});