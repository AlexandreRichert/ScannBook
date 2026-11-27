import { afterEach, describe, expect, it } from '@jest/globals';

import { armReturnToBook, disarmReturnToBook, takeReturnToBook } from '@/lib/ReturnAfterSignIn';

const ISBN = '9782070360024';

describe('return to a book after signing in', () => {
  afterEach(disarmReturnToBook);

  it('gives the book screen back once, then nothing', () => {
    armReturnToBook(ISBN);

    expect(takeReturnToBook()).toBe(`/book/${ISBN}`);
    expect(takeReturnToBook()).toBeNull();
  });

  it('gives nothing when no book was armed', () => {
    expect(takeReturnToBook()).toBeNull();
  });

  it('forgets the book after a failed sign-in', () => {
    armReturnToBook(ISBN);
    disarmReturnToBook();

    expect(takeReturnToBook()).toBeNull();
  });

  it.each([undefined, '', 'abc', '978207036002', '/sign-in', `${ISBN}/../profile`])(
    'ignores %p, which is not an ISBN-13',
    (value: string | undefined) => {
      armReturnToBook(value);

      expect(takeReturnToBook()).toBeNull();
    },
  );
});
