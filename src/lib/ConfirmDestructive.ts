import { Alert } from 'react-native';

/** Asks before an action that cannot be undone. Resolves to true when the user confirms. */
export function confirmDestructive(title: string, message: string, confirmLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      // Android closes the dialog on a tap outside it, which must count as a cancel
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}