import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { LibraryBook } from '@/data/Library';

export function LibraryBookRow({ book }: { book: LibraryBook }) {
  const router = useRouter();
  const authors = book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu';

  return (
    <Pressable
      onPress={() => router.push(`/book/${book.isbn13}`)}
      accessibilityRole="button"
      accessibilityLabel={`${book.title}, ${authors}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <BookCover
        key={book.isbn13}
        title={book.title}
        coverUrl={book.cover_url ?? undefined}
        width={56}
        placeholderColors={{ background: C.coverPlaceholder, text: C.text }}
      />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.authors} numberOfLines={1}>
          {authors}
        </Text>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={C.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
  },
  authors: {
    color: C.textSecondary,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});