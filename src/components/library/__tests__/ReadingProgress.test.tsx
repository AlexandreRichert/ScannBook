import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';

import { ReadingProgress } from '@/components/library/ReadingProgress';

jest.mock('@/components/ui/PressableScale');

type SaveHandler = (page: number) => Promise<string | null>;

/** Resolves like a successful save. */
const saveOk = () => jest.fn<SaveHandler>(async () => null);

const pageField = () => screen.getByLabelText('Page actuelle, sur 300');

afterEach(() => {
  jest.useRealTimers();
});

describe('ReadingProgress', () => {
  it('saves the typed page when leaving the field', async () => {
    const user = userEvent.setup();
    const onSave = saveOk();
    await render(<ReadingProgress currentPage={null} pageCount={300} onSave={onSave} onFinish={jest.fn()} />);

    await user.type(pageField(), '150');

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(150);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('shows an error and saves nothing for a page beyond the end of the book', async () => {
    const user = userEvent.setup();
    const onSave = saveOk();
    await render(<ReadingProgress currentPage={null} pageCount={300} onSave={onSave} onFinish={jest.fn()} />);

    await user.type(pageField(), '400');

    expect(screen.getByRole('alert')).toHaveTextContent('Ce livre a 300 pages.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows the message returned by a failed save', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn<SaveHandler>(async () => 'Enregistrement impossible.');
    await render(<ReadingProgress currentPage={null} pageCount={300} onSave={onSave} onFinish={jest.fn()} />);

    await user.type(pageField(), '150');

    expect(screen.getByRole('alert')).toHaveTextContent('Enregistrement impossible.');
  });

  it('saves the next page shortly after pressing "Page suivante"', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onSave = saveOk();
    await render(<ReadingProgress currentPage={120} pageCount={300} onSave={onSave} onFinish={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Page suivante' }));
    await user.press(screen.getByRole('button', { name: 'Page suivante' }));
    expect(onSave).not.toHaveBeenCalled();

    await jest.runOnlyPendingTimersAsync();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(122);
  });

  it('cannot go below page 0', async () => {
    await render(<ReadingProgress currentPage={0} pageCount={300} onSave={saveOk()} onFinish={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Page précédente' })).toBeDisabled();
  });

  it('offers to mark the book as read on the last page', async () => {
    const user = userEvent.setup();
    const onFinish = jest.fn();
    await render(<ReadingProgress currentPage={300} pageCount={300} onSave={saveOk()} onFinish={onFinish} />);

    expect(screen.getByRole('button', { name: 'Page suivante' })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Passer en « Lu »' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('explains why there is no progress when the page count is unknown', async () => {
    await render(<ReadingProgress currentPage={null} pageCount={null} onSave={saveOk()} onFinish={jest.fn()} />);

    expect(screen.getByText(/nombre de pages de ce livre est inconnu/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Page actuelle/)).not.toBeOnTheScreen();
  });
});
