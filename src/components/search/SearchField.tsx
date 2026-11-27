import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { Fonts } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

export function SearchField({ value, onChangeText, onSubmit }: SearchFieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.icon}>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={20}
          tintColor={C.textSecondary}
        />
      </View>
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
    borderRadius: 4,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same recipe as TextField: stretched rather than a percentage height, so iOS centers the placeholder on the icon
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: 0,
    textAlignVertical: 'center',
    color: C.text,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
