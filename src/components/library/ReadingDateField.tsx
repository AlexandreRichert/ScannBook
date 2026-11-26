import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';
import { formatDay, parseDay, toDay } from '@/lib/Shelves';

type ReadingDateFieldProps = {
  label: string;
  /** Shown while the date is not set, e.g. « Pas encore terminé ». */
  emptyLabel: string;
  /** `YYYY-MM-DD`, or null when the date is not set yet. */
  value: string | null;
  minimumDay?: string | null;
  maximumDay: string;
  disabled?: boolean;
  onChange: (day: string) => void;
};

/** One reading date as a field card (Figma frame 10), editable with the platform date picker. */
export function ReadingDateField({
  label,
  emptyLabel,
  value,
  minimumDay,
  maximumDay,
  disabled = false,
  onChange,
}: ReadingDateFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const minimumDate = minimumDay ? parseDay(minimumDay) : undefined;
  const maximumDate = parseDay(maximumDay);

  function select(date: Date) {
    setIsDialogOpen(false);
    const day = toDay(date);
    if (day !== value) onChange(day);
  }

  const calendar = (
    <SymbolView
      name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
      size={18}
      tintColor={Palette.ink}
    />
  );

  // iOS draws its own compact button that opens a calendar, but it cannot show an empty date
  if (Platform.OS === 'ios' && value) {
    return (
      <View style={styles.card}>
        <View style={styles.text}>
          <Text style={styles.caps}>{label}</Text>
          <DateTimePicker
            value={parseDay(value)}
            mode="date"
            display="compact"
            locale="fr_FR"
            accentColor={Palette.ink}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
            onValueChange={(_, date) => select(date)}
          />
        </View>
        {calendar}
      </View>
    );
  }

  // The picker renders nothing on web, so the date is read only there
  const editable = Platform.OS !== 'web' && !disabled;

  return (
    <>
      <Pressable
        onPress={() => (Platform.OS === 'ios' ? onChange(maximumDay) : setIsDialogOpen(true))}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label} ${formatDay(value)}, modifier` : `${label}, ajouter une date`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.text}>
          <Text style={styles.caps}>{label}</Text>
          <Text style={value ? styles.value : styles.empty}>{value ? formatDay(value) : emptyLabel}</Text>
        </View>
        {calendar}
      </Pressable>
      {/* Android shows a dialog as soon as the picker mounts, so it only exists while open */}
      {isDialogOpen && (
        <DateTimePicker
          value={value ? parseDay(value) : maximumDate}
          mode="date"
          presentation="dialog"
          accentColor={Palette.ink}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_, date) => select(date)}
          onDismiss={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  text: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  caps: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  value: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  empty: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
