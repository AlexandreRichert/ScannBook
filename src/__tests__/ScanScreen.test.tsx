import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import ScanScreen from '@/app/(app)/(tabs)/scan';

type ScanHandler = (result: { data: string }) => void;

// The handler the screen last passed to the camera, undefined while locked.
let mockOnScan: ScanHandler | undefined;
const mockPush = jest.fn();

jest.mock('expo-camera', () => ({
  CameraView: (props: { onBarcodeScanned?: ScanHandler }) => {
    mockOnScan = props.onBarcodeScanned;
    return null;
  },
  useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn(), jest.fn()],
}));

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    // The screen counts as focused from mount.
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
    useRouter: () => ({ push: mockPush }),
  };
});

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Visual only, and they pull in Reanimated, which does not load under Jest.
jest.mock('@/components/scan/ScanOverlay', () => ({ ScanOverlay: () => null }));
jest.mock('@/components/scan/ScanUnavailable', () => ({ ScanUnavailable: () => null }));

const notificationAsync = jest.mocked(Haptics.notificationAsync);
const initialOS = Platform.OS;

const VALID_ISBN = '9780306406157';
// EAN-13 product codes, not books.
const NOT_ISBN = '3017620422003';
const OTHER_NOT_ISBN = '5449000000996';

/** Reports a code to the screen the way the camera does, `frames` times in a row. */
const scan = async (data: string, frames = 1) => {
  for (let i = 0; i < frames; i++) {
    await act(async () => mockOnScan?.({ data }));
  }
};

const calls = (type: Haptics.NotificationFeedbackType) =>
  notificationAsync.mock.calls.filter(([called]) => called === type).length;

beforeEach(() => {
  Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  jest.useFakeTimers();
  mockOnScan = undefined;
});

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { value: initialOS, configurable: true });
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('ScanScreen haptics', () => {
  it('vibrates once on a valid ISBN, then opens the book', async () => {
    await render(<ScanScreen />);

    await scan(VALID_ISBN, 5);

    expect(calls(Haptics.NotificationFeedbackType.Success)).toBe(1);
    expect(calls(Haptics.NotificationFeedbackType.Error)).toBe(0);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/book/${VALID_ISBN}`);
  });

  it('vibrates once while the same rejected code stays in view', async () => {
    await render(<ScanScreen />);

    await scan(NOT_ISBN, 10);

    expect(calls(Haptics.NotificationFeedbackType.Error)).toBe(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('vibrates again for a different rejected code', async () => {
    await render(<ScanScreen />);

    await scan(NOT_ISBN, 3);
    await scan(OTHER_NOT_ISBN, 3);

    expect(calls(Haptics.NotificationFeedbackType.Error)).toBe(2);
  });

  it('vibrates again for the same code once the rejection message is gone', async () => {
    await render(<ScanScreen />);

    await scan(NOT_ISBN);
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await scan(NOT_ISBN);

    expect(calls(Haptics.NotificationFeedbackType.Error)).toBe(2);
  });
});
