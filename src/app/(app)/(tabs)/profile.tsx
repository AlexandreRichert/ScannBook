import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReadingStatsCard } from '@/components/profile/ReadingStatsCard';
import { SettingsGroup, SettingsRow } from '@/components/profile/SettingsGroup';
import { ShelfCounts } from '@/components/profile/ShelfCounts';
import { BottomTabInset, Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { confirmDestructive } from '@/lib/ConfirmDestructive';
import { fullName, profileName } from '@/lib/ProfileName';
import { countByShelf, type Shelf } from '@/lib/Shelves';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const { state, retry } = useLibrary();

  const email = session?.user.email ?? '';
  const typedName = fullName(profileName(session?.user));
  // Until a name is typed, the email local part stands in for it
  const name = typedName || capitalize(email.split('@')[0]);
  const initial = (name[0] ?? '?').toUpperCase();

  const books = state.status === 'success' ? state.books : null;
  const readIsbns = books?.filter((book) => book.status === 'read').map((book) => book.isbn13) ?? null;

  const openShelf = (shelf: Shelf) => router.push({ pathname: '/shelf/[shelf]', params: { shelf } });

  // The reset code can only be entered on the signed-out « Mot de passe oublié » flow
  const changePassword = async () => {
    const confirmed = await confirmDestructive(
      'Changer de mot de passe',
      'Tu vas être déconnecté. Sur l’écran de connexion, choisis « Mot de passe oublié ? » pour recevoir un code par email.',
      'Continuer',
    );
    if (confirmed) await signOut();
  };

  const askSignOut = async () => {
    if (await confirmDestructive('Se déconnecter ?', 'Tu pourras te reconnecter avec ton email.', 'Se déconnecter')) {
      await signOut();
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + BottomTabInset + 24 },
      ]}>
      <StatusBar style="dark" />
      <View style={styles.identity}>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.initial}>{initial}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1} accessibilityRole="header">
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <ReadingStatsCard readIsbns={readIsbns} />

      {state.status === 'loading' && (
        <View style={styles.countsPlaceholder}>
          <ActivityIndicator color={Palette.ink} accessibilityLabel="Chargement de ta bibliothèque" />
        </View>
      )}
      {state.status === 'error' && (
        <View style={styles.countsPlaceholder}>
          <Text style={styles.errorText}>Bibliothèque indisponible. Vérifie ta connexion.</Text>
          <Pressable onPress={retry} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.retry}>Réessayer</Text>
          </Pressable>
        </View>
      )}
      {books && <ShelfCounts counts={countByShelf(books)} onOpenShelf={openShelf} />}

      <SettingsGroup title="Compte">
        <SettingsRow
          label="Nom"
          value={typedName}
          placeholder="Ajouter"
          onPress={() => router.push('/edit-name')}
        />
        <SettingsRow label="Adresse email" value={email} />
        <SettingsRow
          label="Mot de passe"
          value="Modifier"
          onPress={changePassword}
          accessibilityHint="Te déconnecte pour passer par « Mot de passe oublié »"
        />
      </SettingsGroup>

      <SettingsGroup title="À propos">
        <SettingsRow
          label="Mentions légales"
          onPress={() => router.push({ pathname: '/legal', params: { page: 'mentions' } })}
        />
        <SettingsRow
          label="Confidentialité"
          onPress={() => router.push({ pathname: '/legal', params: { page: 'confidentialite' } })}
        />
      </SettingsGroup>

      <Pressable
        onPress={askSignOut}
        accessibilityRole="button"
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
          size={16}
          tintColor={Palette.inkSecondary}
        />
        <Text style={styles.signOutLabel}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    gap: 28,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.accentStrong,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(0, 0, 0, 0.12) 100%)',
  },
  initial: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
  },
  email: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  countsPlaceholder: {
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
  retry: {
    color: Palette.accentStrong,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  // A rare action, so a quiet link rather than a full width button
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  signOutLabel: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.display,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
