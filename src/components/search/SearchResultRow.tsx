import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { authorsLabel, joinDetails, publicationYear } from '@/lib/BookFormat';
import type { BookInfo } from '@/types/Book';

type SearchResultRowProps = {
  book: BookInfo;
  onPress: () => void;
};

export function SearchResultRow({ book, onPress }: SearchResultRowProps) {
  const details = joinDetails(authorsLabel(book.authors), publicationYear(book.publishedDate));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={joinDetails(book.title, details)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.cover}>
        <BookCover
          key={book.isbn13}
          title={book.title}
          coverUrl={book.coverUrl}
          width={44}
          placeholderColors={{ background: C.coverPlaceholder, text: C.text }}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          {details}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cover: {
    boxShadow: '0 1px 2px rgba(26, 20, 15, 0.2), 0 6px 14px rgba(26, 20, 15, 0.18)',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  details: {
    color: C.textSecondary,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
