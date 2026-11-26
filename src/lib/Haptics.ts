import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics never matter enough to surface an error, and the web has none to give
const play = (feedback: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  feedback().catch(() => {});
};

/** Light tick for taps that change what is on screen. */
export const tapFeedback = () => play(Haptics.selectionAsync);

/** Something worked, e.g. a book's barcode was read. */
export const successFeedback = () => play(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Something was refused, e.g. a barcode that is not an ISBN. */
export const warningFeedback = () => play(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
