import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReadingDateField } from '@/components/library/ReadingDateField';
import { ReadingProgress } from '@/components/library/ReadingProgress';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { LibraryEntry } from '@/data/Library';
import { confirmDestructive } from '@/lib/ConfirmDestructive';
import { localToday, SHELF_LABELS, type ReadingDates, type Shelf } from '@/lib/Shelves';

type ShelfCardProps = {
  entry: LibraryEntry;
  /** Resolves to a French error message, or null on success. */
  onMove: (shelf: Shelf) => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  onRemove: () => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  onDatesChange: (dates: ReadingDates) => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  onPageChange: (page: number) => Promise<string | null>;
};

/** A book already in the library: its shelf, progress and reading dates, the picker to move it, and a way to remove it. */
export function ShelfCard({ entry, onMove, onRemove, onDatesChange, onPageChange }: ShelfCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleMove(shelf: Shelf) {
    if (isSaving || shelf === entry.status) return;
    setIsSaving(true);
    setError(await onMove(shelf));
    setIsSaving(false);
  }

  async function handleRemove() {
    if (isSaving) return;
    const confirmed = await confirmDestructive(
      'Retirer ce livre ?',
      'Il quittera ta bibliothèque, avec sa pile et ses dates de lecture.',
      'Retirer',
    );
    if (!confirmed) return;
    setIsSaving(true);
    const message = await onRemove();
    // On success the panel swaps this card for the add form, so there is no state left to update
    if (message) {
      setError(message);
      setIsSaving(false);
    }
  }

  // No saving lock here: the iOS calendar reports every day tapped, and dropping one would make the picker jump back
  async function handleDates(dates: ReadingDates) {
    setError(await onDatesChange(dates));
  }

  // Same rules as datesForShelf: only a book you started has a start date, only a finished one has an end date
  const hasStart = entry.status === 'reading' || entry.status === 'read' || entry.status === 'abandoned';
  const hasEnd = entry.status === 'read';
  const today = localToday();

  return (
    <View style={styles.panel}>
      <View style={styles.confirmation} accessibilityLiveRegion="polite">
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={22}
          tintColor={C.primary}
        />
        <Text style={styles.confirmationText}>
          Dans ta pile <Text style={styles.strong}>{SHELF_LABELS[entry.status]}</Text>
        </Text>
      </View>

      {entry.status === 'reading' && (
        <>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Progression
          </Text>
          <ReadingProgress
            currentPage={entry.current_page}
            pageCount={entry.page_count}
            disabled={isSaving}
            onSave={onPageChange}
            onFinish={() => handleMove('read')}
          />
        </>
      )}

      {hasStart && (
        <>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Dates de lecture
          </Text>
          <View style={styles.dates}>
            <ReadingDateField
              label="Commencé le"
              value={entry.started_at}
              maximumDay={entry.finished_at ?? today}
              disabled={isSaving}
              onChange={(day) => handleDates({ started_at: day, finished_at: entry.finished_at })}
            />
            {hasEnd && (
              <>
                <View style={styles.separator} />
                <ReadingDateField
                  label="Terminé le"
                  value={entry.finished_at}
                  minimumDay={entry.started_at}
                  maximumDay={today}
                  disabled={isSaving}
                  onChange={(day) => handleDates({ started_at: entry.started_at, finished_at: day })}
                />
              </>
            )}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Changer de pile
      </Text>
      <ShelfPicker value={entry.status} onChange={handleMove} disabled={isSaving} />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Pressable
        onPress={handleRemove}
        disabled={isSaving}
        accessibilityRole="button"
        style={({ pressed }) => [styles.remove, (pressed || isSaving) && styles.removePressed]}>
        <Text style={styles.removeText}>Retirer de ma bibliothèque</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 28,
    gap: 14,
  },
  confirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  confirmationText: {
    flex: 1,
    color: C.text,
    fontSize: 16,
  },
  strong: {
    fontWeight: '700',
  },
  dates: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  error: {
    color: C.error,
    fontSize: 15,
  },
  remove: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  removePressed: {
    opacity: 0.5,
  },
  removeText: {
    color: C.error,
    fontSize: 16,
    fontWeight: '600',
  },
});