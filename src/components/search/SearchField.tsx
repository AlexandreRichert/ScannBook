import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

export function SearchField({ value, onChangeText, onSubmit }: SearchFieldProps) {
  return (
    <View style={styles.field}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={20}
        tintColor={C.textSecondary}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Titre ou auteur"
        placeholderTextColor={C.textMuted}
        accessibilityLabel="Rechercher un livre par titre ou auteur"
        returnKeyType="search"
        autoCorrect={false}
        autoFocus
        style={styles.input}
      />
      {value !== '' && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={C.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: C.surface,
    boxShadow: '0 1px 2px rgba(26, 20, 15, 0.05), 0 6px 14px rgba(26, 20, 15, 0.05)',
  },
  input: {
    flex: 1,
    height: '100%',
    color: C.text,
    fontSize: 17,
  },
  pressed: {
    opacity: 0.7,
  },
});
