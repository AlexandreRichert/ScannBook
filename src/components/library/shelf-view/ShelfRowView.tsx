import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';

import { BookSpine } from './BookSpine';
import { ShelfBoard } from './ShelfBoard';
import { ShelfCover } from './ShelfCover';
import { COVER_GAP, SHELF_PADDING, SPINE_GAP, type ShelfRow } from './ShelfRows';

/** One shelf of the bookcase: its books, then the board under them, which spans the whole screen. */
export const ShelfRowView = memo(function ShelfRowView({ row, coverWidth }: { row: ShelfRow; coverWidth: number }) {
  return (
    <View>
      {row.kind === 'covers' ? (
        <View style={[styles.books, { gap: COVER_GAP }]}>
          {row.books.map((book) => (
            <ShelfCover key={book.id} book={book} width={coverWidth} />
          ))}
        </View>
      ) : (
        <View style={[styles.books, { gap: SPINE_GAP }]}>
          {row.books.map((book) => (
            <BookSpine key={book.id} book={book} />
          ))}
        </View>
      )}
      <ShelfBoard />
    </View>
  );
});

const styles = StyleSheet.create({
  books: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SHELF_PADDING,
    marginTop: 12,
  },
});
