import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, MaxContentWidth, Palette } from '@/constants/theme';

import { BookSpine } from './BookSpine';
import { ShelfBoard } from './ShelfBoard';
import { ShelfCover } from './ShelfCover';
import { CAPTION_GAP, CAPTION_WIDTH, COVER_GAP, SHELF_PADDING, SPINE_GAP, type ShelfRow } from './ShelfRows';

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
        <View style={styles.books}>
          <View style={styles.spines}>
            {row.books.map((book) => (
              <BookSpine key={book.id} book={book} />
            ))}
          </View>
          {row.caption && <Text style={styles.caption}>{row.caption}</Text>}
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
  spines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPINE_GAP,
  },
  caption: {
    width: CAPTION_WIDTH,
    marginLeft: CAPTION_GAP,
    marginBottom: 4,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
