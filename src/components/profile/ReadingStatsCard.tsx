import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/profile/SettingsGroup';
import { Fonts, Palette, Space } from '@/constants/theme';
import { useReadingStats } from '@/hooks/useReadingStats';
import { spineFor } from '@/lib/Spines';

const SPINE_GAP = 2;
const SHELF_HEIGHT = 64;
// Spines.ts heights are sized for the home cubbies, this shelf is shorter
const SPINE_HEIGHT_OFFSET = 20;

// French puts zero in the singular: « 0 livre »
const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

const formatNumber = (value: number) => value.toLocaleString('fr-FR');

type ReadingStatsCardProps = {
  /** ISBNs of the books on the « Lu » shelf, null while the library is loading. */
  readIsbns: string[] | null;
};

/** « Lus en {year} »: books and pages read this year, and those books standing on a shelf. */
export function ReadingStatsCard({ readIsbns }: ReadingStatsCardProps) {
  const year = new Date().getFullYear();
  const { state, retry } = useReadingStats(year);
  const [shelfWidth, setShelfWidth] = useState(0);

  // The library has no finish dates, so the year count decides how many read books stand on the shelf
  const yearIsbns = state.status === 'success' && readIsbns ? readIsbns.slice(0, state.stats.books) : [];
  const spines = fitSpines(yearIsbns, shelfWidth);

  return (
    <View style={styles.section}>
      <SectionTitle>Lus en {year}</SectionTitle>
      <View style={styles.card}>
        {state.status === 'error' && (
          <View style={styles.error}>
            <Text style={styles.note}>Statistiques indisponibles. Vérifie ta connexion.</Text>
            <Pressable onPress={retry} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.retry}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {state.status === 'loading' && (
          <View style={styles.loading}>
            <ActivityIndicator color={Palette.ink} accessibilityLabel="Chargement des statistiques" />
          </View>
        )}

        {state.status === 'success' && (
          <>
            <View style={styles.figures}>
              <Figure value={state.stats.books} label={plural(state.stats.books, 'livre lu', 'livres lus')} />
              <View style={styles.rule} />
              <Figure value={state.stats.pages} label={plural(state.stats.pages, 'page lue', 'pages lues')} />
            </View>

            <View>
              <View
                style={styles.shelf}
                onLayout={(event) => setShelfWidth(event.nativeEvent.layout.width)}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants">
                {state.stats.books === 0 ? (
                  <>
                    <View style={styles.ghost} />
                    <Text style={styles.emptyText}>Ton premier livre terminé se rangera ici.</Text>
                  </>
                ) : (
                  spines.map((spine) => (
                    <View
                      key={spine.key}
                      style={[
                        styles.spine,
                        { backgroundColor: spine.color, width: spine.width, height: spine.height - SPINE_HEIGHT_OFFSET },
                      ]}
                    />
                  ))
                )}
              </View>
              <View style={styles.plank} />
            </View>

            {state.stats.booksWithoutPages > 0 && (
              <Text style={styles.note}>
                {state.stats.booksWithoutPages}{' '}
                {plural(state.stats.booksWithoutPages, 'livre n’a pas', 'livres n’ont pas')} de nombre de pages
                connu, {plural(state.stats.booksWithoutPages, 'il n’est', 'ils ne sont')} pas dans les pages lues.
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.figure}>
      <Text style={styles.value} numberOfLines={1}>
        {formatNumber(value)}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function fitSpines(isbns: string[], width: number) {
  const spines = [];
  let used = 0;
  for (const isbn of isbns) {
    const spine = spineFor(isbn);
    used += spine.width + (spines.length > 0 ? SPINE_GAP : 0);
    if (used > width) break;
    spines.push(spine);
  }
  return spines;
}

const styles = StyleSheet.create({
  section: {
    gap: Space.block,
  },
  card: {
    gap: Space.card,
    padding: Space.card,
    borderRadius: 6,
    backgroundColor: Palette.accentSoft,
  },
  loading: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figures: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  figure: {
    flex: 1,
  },
  rule: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: Palette.line,
  },
  value: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  label: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  shelf: {
    height: SHELF_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPINE_GAP,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  spine: {
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(0, 0, 0, 0.34) 100%)',
  },
  ghost: {
    width: 12,
    height: 44,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.lineStrong,
  },
  emptyText: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 4,
    color: Palette.inkTertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  plank: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  note: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    gap: 8,
  },
  retry: {
    color: Palette.accentStrong,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
});
