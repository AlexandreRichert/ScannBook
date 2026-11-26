import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { StatusButton } from '@/components/book/BookStatus';
import { ProgressBar } from '@/components/library/ProgressBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import { parseCurrentPage, progressRatio } from '@/lib/ReadingProgress';

// Lets a few taps on + or - add up before the page is saved
const STEP_SAVE_DELAY = 600;

type ReadingProgressProps = {
  currentPage: number | null;
  pageCount: number | null;
  disabled?: boolean;
  /** Resolves to a French error message, or null on success. */
  onSave: (page: number) => Promise<string | null>;
  onFinish: () => void;
};

/** Current page of a book being read with steppers, its progress bar, and a way to mark it read on the last page. */
export function ReadingProgress({ currentPage, pageCount, disabled = false, onSave, onFinish }: ReadingProgressProps) {
  const saved = currentPage === null ? '' : String(currentPage);
  const [text, setText] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
    },
    [],
  );

  if (pageCount === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.hint}>Le nombre de pages de ce livre est inconnu, la progression n’est pas disponible.</Text>
      </View>
    );
  }
  const total = pageCount;
  const isDirty = text.trim() !== saved;
  const typed = Number(text);
  const shownPage = /^\d+$/.test(text.trim()) && typed <= total ? typed : (currentPage ?? 0);
  const percent = Math.round(progressRatio(shownPage, total) * 100);

  async function save(value: string) {
    if (value.trim() === saved || isSaving) return;
    const parsed = parseCurrentPage(value, total);
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

  function step(delta: number) {
    const next = Math.min(Math.max(shownPage + delta, 0), total);
    setText(String(next));
    setError(null);
    if (stepTimer.current) clearTimeout(stepTimer.current);
    stepTimer.current = setTimeout(() => save(String(next)), STEP_SAVE_DELAY);
  }

  const locked = disabled || isSaving;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.stepper}>
          <StepButton icon="minus" label="Page précédente" onPress={() => step(-1)} disabled={locked || shownPage <= 0} />
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={() => setIsEditing(true)}
            // The number pad has no return key on iOS, so leaving the field saves too
            onBlur={() => {
              setIsEditing(false);
              save(text);
            }}
            onSubmitEditing={() => save(text)}
            keyboardType="number-pad"
            maxLength={5}
            selectTextOnFocus
            editable={!locked}
            placeholder="0"
            placeholderTextColor={Palette.inkTertiary}
            accessibilityLabel={`Page actuelle, sur ${total}`}
            style={styles.input}
          />
          <StepButton icon="plus" label="Page suivante" onPress={() => step(1)} disabled={locked || shownPage >= total} />
        </View>
        <View style={styles.total}>
          <Text style={styles.percent}>{percent} %</Text>
          <Text style={styles.pages}>sur {total} pages</Text>
        </View>
      </View>
      <ProgressBar ratio={progressRatio(shownPage, total)} />
      {isEditing && isDirty && (
        <StatusButton label={isSaving ? 'Enregistrement…' : 'Enregistrer'} variant="secondary" onPress={() => save(text)} />
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

function StepButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: 'plus' | 'minus';
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <PressableScale
      haptic
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={[styles.stepButton, disabled && styles.dimmed]}>
      <SymbolView name={{ ios: icon, android: icon === 'plus' ? 'add' : 'remove', web: icon === 'plus' ? 'add' : 'remove' }} size={20} tintColor={Palette.ink} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paper,
    borderWidth: 1,
    borderColor: Palette.lineStrong,
  },
  dimmed: {
    opacity: 0.4,
  },
  // A fixed width keeps the steppers and the total in place while typing (web inputs size to their content)
  input: {
    width: 88,
    paddingVertical: 0,
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
    textAlign: 'center',
  },
  total: {
    alignItems: 'flex-end',
    gap: 2,
  },
  percent: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  pages: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: Palette.danger,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  finished: {
    gap: 10,
    paddingTop: 4,
  },
  finishedText: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 15,
    fontWeight: '700',
  },
});
