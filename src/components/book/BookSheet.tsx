import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { BookInfo } from '@/types/Book';

const COVER_WIDTH = 140;
/** About 4 lines at 15 px on a phone: shorter descriptions are shown whole. */
const COLLAPSIBLE_DESCRIPTION_LENGTH = 180;

/** Book details laid out as the « Fiche livre » mockup (Figma frame 07). */
export function BookSheet({ book }: { book: BookInfo }) {
  const metadata = [
    { label: 'Éditeur', value: book.publisher },
    { label: 'Parution', value: book.publishedDate?.slice(0, 4) },
    { label: 'Pages', value: book.pageCount?.toString() },
  ].filter((item): item is { label: string; value: string } => item.value !== undefined);

  return (
    <View style={styles.sheet}>
      <View style={styles.coverWrapper}>
        <View style={styles.coverShadow} />
        <BookCover
          key={book.isbn13}
          title={book.title}
          coverUrl={book.coverUrl}
          width={COVER_WIDTH}
          placeholderColors={{ background: C.coverPlaceholder, text: C.text }}
        />
      </View>

      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">
          {book.title}
        </Text>
        {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
        <Text style={styles.authors}>
          {book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu'}
        </Text>
      </View>

      {metadata.length > 0 && (
        <View style={styles.metadata}>
          {metadata.map((item, index) => (
            <View key={item.label} style={[styles.metadataItem, index > 0 && styles.metadataDivider]}>
              <Text style={styles.metadataLabel}>{item.label}</Text>
              <Text style={styles.metadataValue} numberOfLines={1} adjustsFontSizeToFit>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {book.description && <Description text={book.description} />}
    </View>
  );
}

function Description({ text }: { text: string }) {
  const collapsible = text.length > COLLAPSIBLE_DESCRIPTION_LENGTH;
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.description}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Résumé
      </Text>
      <Text style={styles.descriptionText} numberOfLines={collapsible && !expanded ? 4 : undefined}>
        {text}
      </Text>
      {collapsible && (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.readMore}>{expanded ? 'Réduire' : 'Lire la suite'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 20,
  },
  coverWrapper: {
    alignSelf: 'center',
    marginBottom: -2,
  },
  coverShadow: {
    position: 'absolute',
    top: 6,
    left: 4,
    width: COVER_WIDTH,
    height: COVER_WIDTH * 1.5,
    borderRadius: 4,
    backgroundColor: C.coverShadow,
  },
  heading: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: C.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    textAlign: 'center',
  },
  authors: {
    color: C.textSecondary,
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
  },
  metadata: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
  },
  metadataItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  metadataDivider: {
    borderLeftColor: C.border,
    borderLeftWidth: 1,
  },
  metadataLabel: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 15,
  },
  metadataValue: {
    color: C.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  description: {
    gap: 7,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
  },
  descriptionText: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  readMore: {
    color: C.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 3,
  },
  pressed: {
    opacity: 0.6,
  },
});
