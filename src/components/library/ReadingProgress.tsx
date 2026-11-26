import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { StatusButton } from '@/components/book/BookStatus';
import { ProgressBar } from '@/components/library/ProgressBar';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { parseCurrentPage, progressRatio } from '@/lib/ReadingProgress';

type ReadingProgressProps = {
  currentPage: number | null;
  pageCount: number | null;
  disabled?: boolean;
  /** Resolves to a French error message, or null on success. */
  onSave: (page: number) => Promise<string | null>;
  onFinish: () => void;
};

/** Current page of a book being read, its progress bar, and a way to mark it read on the last page. */
export function ReadingProgress({ currentPage, pageCount, disabled = false, onSave, onFinish }: ReadingProgressProps) {
  const saved = currentPage === null ? '' : String(currentPage);
  const [text, setText] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (pageCount === null) {
    return <Text style={styles.hint}>Le nombre de pages de ce livre est inconnu, la progression n’est pas disponible.</Text>;
  }
  const total = pageCount;
  const isDirty = text.trim() !== saved;

  async function save() {
    if (!isDirty || isSaving) return;
    const parsed = parseCurrentPage(text, total);
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    setIsSaving(true);
    const message = await onSave(parsed.page);
    setError(message);
    // « 012 » is saved as 12: show what was saved so the field is no longer marked as changed
    if (!message) setText(String(parsed.page));
    setIsSaving(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Page actuelle</Text>
        <View style={styles.pages}>
          <TextInput
            value={text}
            onChangeText={setText}
            // The number pad has no return key on iOS, so leaving the field saves too
            onBlur={save}
            onSubmitEditing={save}
            keyboardType="number-pad"
            maxLength={5}
            selectTextOnFocus
            editable={!disabled && !isSaving}
            placeholder="0"
            placeholderTextColor={C.textMuted}
            accessibilityLabel={`Page actuelle, sur ${total}`}
            style={styles.input}
          />
          <Text style={styles.total}>/ {total}</Text>
        </View>
      </View>
      <ProgressBar ratio={progressRatio(currentPage, total)} />
      {isDirty && (
        <StatusButton label={isSaving ? 'Enregistrement…' : 'Enregistrer'} variant="secondary" onPress={save} />
      )}
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {currentPage === total && (
        <View style={styles.finished}>
          <Text style={styles.finishedText}>Tu as atteint la dernière page.</Text>
          <StatusButton label="Passer en « Lu »" onPress={onFinish} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: C.text,
    fontSize: 16,
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    minWidth: 64,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    fontSize: 16,
    textAlign: 'right',
  },
  total: {
    color: C.textSecondary,
    fontSize: 16,
  },
  hint: {
    color: C.textSecondary,
    fontSize: 15,
  },
  error: {
    color: C.error,
    fontSize: 15,
  },
  finished: {
    gap: 10,
    paddingTop: 4,
  },
  finishedText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
});