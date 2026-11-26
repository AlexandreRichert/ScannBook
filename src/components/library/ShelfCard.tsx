import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BOOK_SHEET_GUTTER } from '@/components/book/BookSheet';
import { ReadingDateField } from '@/components/library/ReadingDateField';
import { ReadingProgress } from '@/components/library/ReadingProgress';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { Fonts, Palette } from '@/constants/theme';
import type { LibraryEntry } from '@/data/Library';
import { localToday, type ReadingDates, type Shelf } from '@/lib/Shelves';

type ShelfCardProps = {
  entry: LibraryEntry;
  /** Resolves to a French error message, or null on success. */
  onMove: (shelf: Shelf) => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  onDatesChange: (dates: ReadingDates) => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  onPageChange: (page: number) => Promise<string | null>;
};

/** A book already in the library: its shelf, progress and reading dates, and the picker to move it. */
export function ShelfCard({ entry, onMove, onDatesChange, onPageChange }: ShelfCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleMove(shelf: Shelf) {
    if (isSaving || shelf === entry.status) return;
    setIsSaving(true);
    setError(await onMove(shelf));
    setIsSaving(false);
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
      <View style={styles.group}>
        <Text style={styles.caps} accessibilityRole="header">
          Pile
        </Text>
        <View style={styles.bleed}>
          <ShelfPicker
            value={entry.status}
            onChange={handleMove}
            disabled={isSaving}
            scrollable
            contentContainerStyle={styles.bleedContent}
          />
        </View>
      </View>
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      {entry.status === 'reading' && (
        <ReadingProgress
          currentPage={entry.current_page}
          pageCount={entry.page_count}
          disabled={isSaving}
          onSave={onPageChange}
          onFinish={() => handleMove('read')}
        />
      )}

      {hasStart && (
        <View style={styles.dates}>
          <ReadingDateField
            label="Début"
            emptyLabel="Pas encore renseigné"
            value={entry.started_at}
            maximumDay={entry.finished_at ?? today}
            disabled={isSaving}
            onChange={(day) => handleDates({ started_at: day, finished_at: entry.finished_at })}
          />
          {hasEnd && (
            <ReadingDateField
              label="Fin"
              emptyLabel="Pas encore terminé"
              value={entry.finished_at}
              minimumDay={entry.started_at}
              maximumDay={today}
              disabled={isSaving}
              onChange={(day) => handleDates({ started_at: entry.started_at, finished_at: day })}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 10,
    gap: 14,
  },
  group: {
    gap: 8,
  },
  caps: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  // The chip row scrolls to the screen edges, past the content padding
  bleed: {
    marginHorizontal: -BOOK_SHEET_GUTTER,
  },
  bleedContent: {
    paddingHorizontal: BOOK_SHEET_GUTTER,
  },
  dates: {
    gap: 8,
  },
  error: {
    color: Palette.danger,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
});
