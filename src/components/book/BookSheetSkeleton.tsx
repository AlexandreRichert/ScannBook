import { ActivityIndicator, StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';

const DESCRIPTION_LINES: DimensionValue[] = ['100%', '94%', '97%', '63%'];

/** Placeholder of the book sheet while the lookup runs (Figma frame 12). */
export function BookSheetSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Recherche du livre" accessibilityRole="progressbar">
      <View style={styles.skeleton}>
        <View style={[styles.bone, styles.cover]} />
        <View style={styles.heading}>
          <View style={[styles.bone, styles.title]} />
          <View style={[styles.bone, styles.authors]} />
        </View>
        <View style={[styles.bone, styles.metadata]} />
        <View style={styles.description}>
          <View style={[styles.bone, styles.sectionTitle]} />
          <View style={styles.lines}>
            {DESCRIPTION_LINES.map((width, index) => (
              <View key={index} style={[styles.bone, styles.line, { width }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.loader}>
        <ActivityIndicator color={C.primary} />
        <Text style={styles.loaderText}>Recherche du livre…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 64,
  },
  skeleton: {
    gap: 22,
  },
  bone: {
    backgroundColor: C.skeleton,
    borderRadius: 6,
  },
  cover: {
    alignSelf: 'center',
    width: 140,
    height: 210,
    borderRadius: 8,
  },
  heading: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    width: 180,
    height: 24,
    borderRadius: 8,
  },
  authors: {
    width: 120,
    height: 16,
  },
  metadata: {
    height: 64,
    borderRadius: 12,
  },
  description: {
    gap: 12,
  },
  sectionTitle: {
    width: 90,
    height: 18,
  },
  lines: {
    gap: 10,
  },
  line: {
    height: 12,
  },
  loader: {
    alignItems: 'center',
    gap: 14,
  },
  loaderText: {
    color: C.textTertiary,
    fontSize: 14,
    lineHeight: 17,
  },
});
