import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View, type HostInstance } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';
import { LIBRARY_SORT_LABELS, LIBRARY_SORTS, type LibrarySort } from '@/lib/LibrarySort';

// The pill is narrow, the menu spells the options out
const PILL_LABELS: Record<LibrarySort, string> = {
  recent: 'Récents',
  title: 'Titre',
  author: 'Auteur',
};

type SortPickerProps = {
  value: LibrarySort;
  onChange: (sort: LibrarySort) => void;
};

/** « Récents ⌄ » pill opening a small menu of sort orders, right under it. */
export function SortPicker({ value, onChange }: SortPickerProps) {
  const pill = useRef<HostInstance>(null);
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });

  const show = () => {
    pill.current?.measureInWindow((x, y, pillWidth, pillHeight) => {
      setAnchor({ top: y + pillHeight + 6, right: width - x - pillWidth });
      setOpen(true);
    });
  };

  const pick = (sort: LibrarySort) => {
    setOpen(false);
    onChange(sort);
  };

  return (
    <>
      <Pressable
        ref={pill}
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={`Trier par : ${LIBRARY_SORT_LABELS[value]}`}
        accessibilityState={{ expanded: open }}
        hitSlop={4}
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
        <Text style={styles.pillLabel}>{PILL_LABELS[value]}</Text>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
          size={16}
          tintColor={Palette.ink}
        />
      </Pressable>

      {/* Translucent bars on Android so the measured window coordinates line up inside the modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Fermer le tri" />
        <View style={[styles.menu, anchor]} accessibilityRole="menu" accessibilityLabel="Trier par">
          {LIBRARY_SORTS.map((sort) => {
            const selected = sort === value;
            return (
              <Pressable
                key={sort}
                onPress={() => pick(sort)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                <Text style={[styles.optionLabel, selected && styles.optionSelected]}>{LIBRARY_SORT_LABELS[sort]}</Text>
                {selected && (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={16}
                    tintColor={Palette.ink}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
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
  pillLabel: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  pressed: {
    opacity: 0.7,
  },
  menu: {
    position: 'absolute',
    minWidth: 180,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  optionPressed: {
    backgroundColor: Palette.paperSunken,
  },
  optionLabel: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionSelected: {
    color: Palette.ink,
    fontWeight: '700',
  },
});
