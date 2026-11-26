import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ShelfPicker } from '@/components/library/ShelfPicker';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { LibraryEntry } from '@/data/Library';
import { formatDay, SHELF_LABELS, type Shelf } from '@/lib/Shelves';

type ShelfCardProps = {
  entry: LibraryEntry;
  /** Resolves to a French error message, or null on success. */
  onMove: (shelf: Shelf) => Promise<string | null>;
};

/** A book already in the library: its shelf, its reading dates, and the picker to move it. */
export function ShelfCard({ entry, onMove }: ShelfCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleMove(shelf: Shelf) {
    if (isSaving || shelf === entry.status) return;
    setIsSaving(true);
    setError(await onMove(shelf));
    setIsSaving(false);
  }

  const dates = [
    entry.started_at && `Commencé le ${formatDay(entry.started_at)}`,
    entry.finished_at && `Terminé le ${formatDay(entry.finished_at)}`,
  ].filter(Boolean);

  return (
    <View style={styles.panel}>
      <View style={styles.confirmation} accessibilityLiveRegion="polite">
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={22}
          tintColor={C.primary}
        />
        <View style={styles.confirmationBody}>
          <Text style={styles.confirmationText}>
            Dans ta pile <Text style={styles.strong}>{SHELF_LABELS[entry.status]}</Text>
          </Text>
          {dates.length > 0 && <Text style={styles.dates}>{dates.join(' · ')}</Text>}
        </View>
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Changer de pile
      </Text>
      <ShelfPicker value={entry.status} onChange={handleMove} disabled={isSaving} />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
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
  confirmationBody: {
    flex: 1,
    gap: 4,
  },
  confirmationText: {
    color: C.text,
    fontSize: 16,
  },
  strong: {
    fontWeight: '700',
  },
  dates: {
    color: C.textSecondary,
    fontSize: 14,
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
});