import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';
import { View, type HostInstance } from 'react-native';

import { SortPicker } from '@/components/library/SortPicker';
import type { LibrarySort } from '@/lib/LibrarySort';

// The menu opens once the pill is measured, but Jest has no screen to measure:
// the View mock's measureInWindow never answers. Report a fixed position.
beforeEach(() => {
  const view = View as unknown as { prototype: HostInstance };
  jest
    .spyOn(view.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(200, 100, 90, 36));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SortPicker', () => {
  it('names the current sort order', async () => {
    await render(<SortPicker value="title" onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Trier par : Titre' })).toBeOnTheScreen();
  });

  it('opens a menu with every sort order, the current one selected', async () => {
    const user = userEvent.setup();
    await render(<SortPicker value="recent" onChange={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Trier par : Ajout récent' }));

    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Ajout récent' })).toBeSelected();
    expect(screen.getByRole('menuitem', { name: 'Auteur' })).not.toBeSelected();
  });

  it('calls onChange with the chosen order and closes the menu', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn<(sort: LibrarySort) => void>();
    await render(<SortPicker value="recent" onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Trier par : Ajout récent' }));
    await user.press(screen.getByRole('menuitem', { name: 'Auteur' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('author');
    expect(screen.queryByRole('menuitem')).not.toBeOnTheScreen();
  });
});
