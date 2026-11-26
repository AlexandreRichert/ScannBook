import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useReadingStats } from '@/hooks/useReadingStats';

// French puts zero in the singular: « 0 livre lu »
const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

const formatNumber = (value: number) => value.toLocaleString('fr-FR');

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="subtitle">{formatNumber(value)}</ThemedText>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
    </View>
  );
}

export function ReadingStatsCard() {
  const year = new Date().getFullYear();
  const { state, retry } = useReadingStats(year);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold" accessibilityRole="header">
        Mon année {year}
      </ThemedText>

      {state.status === 'loading' && <ActivityIndicator accessibilityLabel="Chargement des statistiques" />}

      {state.status === 'error' && (
        <>
          <ThemedText themeColor="textSecondary">Statistiques indisponibles. Vérifie ta connexion.</ThemedText>
          <Button label="Réessayer" onPress={retry} />
        </>
      )}

      {state.status === 'success' && (
        <>
          <View style={styles.stats}>
            <Stat value={state.stats.books} label={plural(state.stats.books, 'livre lu', 'livres lus')} />
            <Stat value={state.stats.pages} label={plural(state.stats.pages, 'page lue', 'pages lues')} />
          </View>
          {state.stats.booksWithoutPages > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {state.stats.booksWithoutPages}{' '}
              {plural(state.stats.booksWithoutPages, 'livre n’a pas', 'livres n’ont pas')} de nombre de pages connu.
            </ThemedText>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  stat: {
    flex: 1,
  },
});