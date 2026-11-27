import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink, AuthPrompt } from '@/components/auth/AuthLink';
import { StatusButton } from '@/components/book/BookStatus';
import { CoverWallHero } from '@/components/home/CoverWallHero';
import { PressableScale } from '@/components/ui/PressableScale';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Space } from '@/constants/theme';

/** Home tab without an account: what the app does, the two ways to find a book, and the way in. */
export function GuestHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Space.block, paddingBottom: insets.bottom + BottomTabInset + Space.gutter },
      ]}>
      <StatusBar style="dark" />
      <CoverWallHero
        title={'Que vas-tu lire\n*aujourd’hui* ?'}
        body="Scanne le code-barres d’un livre : titre, auteur, résumé et couverture s’affichent tout seuls."
        action={
          <PressableScale onPress={() => router.push('/sign-in')} accessibilityRole="button" style={styles.signIn}>
            <Text style={styles.signInLabel}>Se connecter</Text>
          </PressableScale>
        }
      />

      <Animated.View entering={FadeInDown.delay(220).duration(320)} style={styles.actions}>
        <AuthButton
          label="Scanner un livre"
          icon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
          onPress={() => router.navigate('/scan')}
        />
        <StatusButton
          label="Rechercher un livre"
          variant="secondary"
          icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          onPress={() => router.push('/search')}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(320)} style={styles.account}>
        <Text style={styles.accountTitle}>Garde tes lectures</Text>
        <Text style={styles.body}>
          Avec un compte, range tes livres par pile, suis ta progression et retrouve tout sur ton téléphone.
        </Text>
        <StatusButton label="Créer un compte" variant="secondary" onPress={() => router.push('/sign-up')} />
        <AuthPrompt question="Déjà un compte ?">
          <AuthLink href="/sign-in" label="Se connecter" />
        </AuthPrompt>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    gap: Space.section,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Space.gutter,
  },
  signIn: {
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: Space.card,
    borderRadius: 4,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  signInLabel: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  actions: {
    gap: Space.block,
  },
  body: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  account: {
    alignItems: 'stretch',
    gap: Space.block,
    padding: Space.card,
    borderRadius: 6,
    backgroundColor: Palette.accentSoft,
  },
  accountTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
    textAlign: 'center',
  },
});
