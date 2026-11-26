// react-native-web's Alert.alert does nothing, so the browser's own dialog stands in
export function confirmDestructive(title: string, message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(`${title}\n\n${message}`));
}