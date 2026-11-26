import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { SearchResultRow } from '@/components/search/SearchResultRow';
import { ShelfTag } from '@/components/search/ShelfTag';
import { ShelfColors, ShelfTints } from '@/constants/theme';
import { SHELF_LABELS, SHELVES } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

// The tag is hidden from screen readers: the result row carries its text
const hidden = { includeHiddenElements: true };

const book ={ isbn13: '9782070368228', title: 'Dune', authors: ['Frank Herbert'] } as BookInfo;

describe('ShelfTag', () => {
  it.each(SHELVES)('shows the %s label with its shelf color', async (shelf) => {
    await render(<ShelfTag shelf={shelf} />);

    expect(screen.getByText(SHELF_LABELS[shelf], hidden)).toBeOnTheScreen();
    expect(screen.getByTestId('shelf-tag-dot', hidden)).toHaveStyle({ backgroundColor: ShelfColors[shelf] });
  });
});

describe('SearchResultRow', () => {
  it('tints the row with the color of its shelf', async () => {
    await render(<SearchResultRow book={book} shelf="reading" onPress={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveStyle(ShelfTints.reading);
  });

  it('stays untinted when the book is not in the library', async () => {
    await render(<SearchResultRow book={book} onPress={jest.fn()} />);

    expect(screen.getByRole('button')).not.toHaveStyle({ backgroundColor: ShelfTints.reading.backgroundColor });
    expect(screen.queryByTestId('shelf-tag-dot', hidden)).not.toBeOnTheScreen();
  });
});
