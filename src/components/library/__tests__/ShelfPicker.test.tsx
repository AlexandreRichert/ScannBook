import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';

import { ShelfPicker } from '@/components/library/ShelfPicker';
import { SHELF_LABELS, SHELVES, type Shelf } from '@/lib/Shelves';

jest.mock('@/components/ui/PressableScale');

describe('ShelfPicker', () => {
  it('shows one radio button per shelf', async () => {
    await render(<ShelfPicker value="reading" onChange={jest.fn()} />);

    expect(screen.getAllByRole('radio')).toHaveLength(SHELVES.length);
  });

  it('checks only the current shelf', async () => {
    await render(<ShelfPicker value="reading" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'En cours' })).toBeChecked();
    for (const shelf of SHELVES.filter((s) => s !== 'reading')) {
      expect(screen.getByRole('radio', { name: SHELF_LABELS[shelf] })).not.toBeChecked();
    }
  });

  it.each(SHELVES)('calls onChange with "%s" when its shelf is pressed', async (shelf) => {
    const user = userEvent.setup();
    const onChange = jest.fn<(shelf: Shelf) => void>();
    await render(<ShelfPicker value={shelf === 'read' ? 'reading' : 'read'} onChange={onChange} />);

    await user.press(screen.getByRole('radio', { name: SHELF_LABELS[shelf] }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(shelf);
  });

  it('shows the number of books next to each shelf', async () => {
    const counts = { wishlist: 2, to_read: 5, reading: 1, read: 12, abandoned: 0 };
    await render(<ShelfPicker value="reading" onChange={jest.fn()} counts={counts} />);

    expect(screen.getByRole('radio', { name: 'À lire · 5' })).toBeOnTheScreen();
  });

  it('ignores presses while disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await render(<ShelfPicker value="reading" onChange={onChange} disabled />);

    const read = screen.getByRole('radio', { name: 'Lu' });
    await user.press(read);

    expect(read).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
