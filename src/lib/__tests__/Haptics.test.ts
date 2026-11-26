import { afterEach, describe, expect, it, jest } from '@jest/globals';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { errorFeedback, successFeedback } from '@/lib/Haptics';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const notificationAsync = jest.mocked(Haptics.notificationAsync);
const initialOS = Platform.OS;

const setOS = (os: typeof Platform.OS) => Object.defineProperty(Platform, 'OS', { value: os, configurable: true });

afterEach(() => {
  setOS(initialOS);
  jest.clearAllMocks();
});

describe('scan haptics', () => {
  it('plays a success notification', () => {
    setOS('ios');
    successFeedback();
    expect(notificationAsync).toHaveBeenCalledTimes(1);
    expect(notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  });

  it('plays an error notification', () => {
    setOS('android');
    errorFeedback();
    expect(notificationAsync).toHaveBeenCalledTimes(1);
    expect(notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
  });

  it('swallows a failure from the device', async () => {
    setOS('android');
    notificationAsync.mockImplementationOnce(() => Promise.reject(new Error('no vibrator')));
    expect(() => errorFeedback()).not.toThrow();
    // Let the rejected promise settle: an unhandled rejection would fail the test.
    await new Promise<void>((resolve) => setImmediate(resolve));
  });

  it('does nothing on the web', () => {
    setOS('web');
    successFeedback();
    errorFeedback();
    expect(notificationAsync).not.toHaveBeenCalled();
  });
});
