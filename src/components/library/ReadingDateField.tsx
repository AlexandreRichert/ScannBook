import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { formatDay, parseDay, toDay } from '@/lib/Shelves';

type ReadingDateFieldProps = {
  label: string;
  /** `YYYY-MM-DD`, or null when the date is not set yet. */
  value: string | null;
  minimumDay?: string | null;
  maximumDay: string;
  disabled?: boolean;
  onChange: (day: string) => void;
};

/** One reading date, editable with the platform date picker. */
export function ReadingDateField({ label, value, minimumDay, maximumDay, disabled = false, onChange }: ReadingDateFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const minimumDate = minimumDay ? parseDay(minimumDay) : undefined;
  const maximumDate = parseDay(maximumDay);

  function select(date: Date) {
    setIsDialogOpen(false);
    const day = toDay(date);
    if (day !== value) onChange(day);
  }

  function renderControl() {
    // The picker renders nothing on web
    if (Platform.OS === 'web') {
      return <Text style={styles.value}>{value ? formatDay(value) : 'Non renseignée'}</Text>;
    }

    // iOS draws its own compact button that opens a calendar, but it cannot show an empty date
    if (Platform.OS === 'ios' && value) {
      return (
        <DateTimePicker
          value={parseDay(value)}
          mode="date"
          display="compact"
          locale="fr_FR"
          accentColor={C.primary}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          disabled={disabled}
          onValueChange={(_, date) => select(date)}
        />
      );
    }

    return (
      <Pressable
        onPress={() => (Platform.OS === 'ios' ? onChange(maximumDay) : setIsDialogOpen(true))}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label} ${formatDay(value)}, modifier` : `${label}, ajouter une date`}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>{value ? formatDay(value) : 'Ajouter'}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {renderControl()}
      {/* Android shows a dialog as soon as the picker mounts, so it only exists while open */}
      {isDialogOpen && (
        <DateTimePicker
          value={value ? parseDay(value) : maximumDate}
          mode="date"
          presentation="dialog"
          accentColor={C.primary}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_, date) => select(date)}
          onDismiss={() => setIsDialogOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 48,
  },
  label: {
    color: C.text,
    fontSize: 16,
  },
  value: {
    color: C.textSecondary,
    fontSize: 16,
  },
  button: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.coverPlaceholder,
    justifyContent: 'center',
  },
  buttonText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});