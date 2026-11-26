import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Ajouter" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Ajouter" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Ajouter' });
    await user.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
