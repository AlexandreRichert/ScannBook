import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { FieldError, TextField } from '@/components/ui/TextField';
import { Fonts, Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { profileName } from '@/lib/ProfileName';

const MAX_LENGTH = 50;

/** Modal to add or change the first and last name shown on the profile. Both stay optional. */
export default function EditNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, updateName } = useAuth();
  const initial = profileName(session?.user);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  async function save() {
    setIsSaving(true);
    const message = await updateName({ firstName, lastName });
    setIsSaving(false);
    if (message) return setError(message);
    close();
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'ios' ? 24 : insets.top + 24 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Ton nom
          </Text>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
        </View>
        <Text style={styles.intro}>Il s’affiche sur ton profil et dans ton accueil. Tu peux le laisser vide.</Text>

        <TextField
          label="Prénom"
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          maxLength={MAX_LENGTH}
          returnKeyType="next"
          autoFocus
        />
        <TextField
          label="Nom"
          value={lastName}
          onChangeText={setLastName}
          autoComplete="family-name"
          textContentType="familyName"
          autoCapitalize="words"
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={save}
        />
        {error && <FieldError message={error} />}

        <AuthButton label={isSaving ? 'Enregistrement…' : 'Enregistrer'} onPress={save} disabled={isSaving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    gap: 18,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  cancel: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  intro: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
