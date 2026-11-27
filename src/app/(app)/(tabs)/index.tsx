import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { GuestHome } from '@/components/guest/GuestHome';
import { BookStrip } from '@/components/home/BookStrip';
import { CoverWallHero, type WallCover } from '@/components/home/CoverWallHero';
import { HomeStats } from '@/components/home/HomeStats';
import { ReadingCards } from '@/components/home/ReadingCards';
import { ScanCard } from '@/components/home/ScanCard';
import { ShelfTile } from '@/components/home/ShelfTile';
import { PressableScale } from '@/components/ui/PressableScale';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Space } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import type { LibraryBook } from '@/data/Library';
import { useLibrary } from '@/hooks/useLibrary';
import { profileName } from '@/lib/ProfileName';
import { countByShelf, SHELF_LABELS, type Shelf } from '@/lib/Shelves';

const OTHER_SHELVES: Shelf[] = ['to_read', 'wishlist', 'read', 'abandoned'];

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  // Two components so the library is only fetched once there is an account to fetch it for
  return isSignedIn ? <SignedInHome /> : <GuestHome />;
}

function SignedInHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { firstName } = profileName(session?.user);
  const initial = (firstName[0] ?? session?.user.email?.[0] ?? '?').toUpperCase();
  const { state, retry } = useLibrary();

  const books = state.status === 'success' ? state.books : [];
  const reading = books.filter((book) => book.status === 'reading');
  const toRead = books.filter((book) => book.status === 'to_read');
  const isNewcomer = state.status === 'success' && books.length === 0;

  const openShelf = (shelf: Shelf) => router.push({ pathname: '/shelf/[shelf]', params: { shelf } });
  const scan = () => router.navigate('/scan');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Space.block, paddingBottom: insets.bottom + BottomTabInset + Space.gutter },
      ]}>
      <StatusBar style="dark" />
      <View style={styles.top}>
        <CoverWallHero
          covers={[...reading, ...books.filter((book) => book.status !== 'reading')].flatMap(toWallCover)}
          title={reading.length > 0 ? 'On reprend\n*la lecture* ?' : 'On lit quoi\n*aujourd’hui* ?'}
          body={
            isNewcomer
              ? 'Scanne ton premier livre pour commencer ta pile.'
              : `${books.length} ${books.length > 1 ? 'livres rangés' : 'livre rangé'} dans tes piles.`
          }
          action={
            <PressableScale
              onPress={() => router.navigate('/profile')}
              accessibilityRole="button"
              accessibilityLabel="Mon profil"
              pressedScale={0.92}
              style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </PressableScale>
          }
        />

        <HomeStats counts={state.status === 'success' ? countByShelf(books) : null} onOpenShelf={openShelf} />
      </View>

      <View style={styles.block}>
        <SectionHeader
          title="En cours"
          link={reading.length > 0 ? { label: 'Tout voir', onPress: () => openShelf('reading') } : undefined}
        />
        {state.status === 'loading' && (
          <View style={[styles.card, styles.loading]}>
            <ActivityIndicator color={Palette.accentStrong} accessibilityLabel="Chargement de tes lectures" />
          </View>
        )}
        {state.status === 'error' && (
          <BookStatus
            icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
            tone="error"
            title="Lectures indisponibles"
            actions={<StatusButton label="Réessayer" onPress={retry} />}>
            <StatusText>Vérifie ta connexion et réessaie.</StatusText>
          </BookStatus>
        )}
        {state.status === 'success' &&
          (reading.length > 0 ? (
            <Animated.View entering={FadeIn.duration(250)}>
              <ReadingCards books={reading} onOpen={(book) => router.push(`/book/${book.isbn13}`)} />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(250)} style={[styles.card, styles.empty]}>
              <Text style={styles.emptyTitle}>{isNewcomer ? 'Ta bibliothèque est vide' : 'Aucune lecture en cours'}</Text>
              <Text style={styles.emptyBody}>
                {isNewcomer
                  ? 'Scanne le code-barres d’un livre pour commencer ta pile.'
                  : 'Choisis ton prochain livre dans ta pile À lire.'}
              </Text>
              {isNewcomer ? (
                <AuthButton
                  label="Scanner un livre"
                  icon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
                  onPress={scan}
                />
              ) : (
                <AuthButton label="Voir ma pile À lire" onPress={() => openShelf('to_read')} />
              )}
            </Animated.View>
          ))}
      </View>

      {/* A newcomer already has the scan button in the card above */}
      {!isNewcomer && <ScanCard onPress={scan} />}

      {toRead.length > 0 && (
        <Animated.View entering={FadeInDown.delay(60).duration(280)} style={styles.block}>
          <SectionHeader title="À lire ensuite" link={{ label: 'Tout voir', onPress: () => openShelf('to_read') }} />
          <BookStrip books={toRead} onOpen={(book) => router.push(`/book/${book.isbn13}`)} />
        </Animated.View>
      )}

      {/* Four empty piles teach nothing to a newcomer, the scan call to action is enough */}
      {state.status === 'success' && !isNewcomer && (
        <Animated.View entering={FadeInDown.delay(120).duration(280)} style={styles.block}>
          <SectionHeader title="Mes piles" link={{ label: 'Tout voir', onPress: () => router.navigate('/library') }} />
          <View style={styles.piles}>
            {OTHER_SHELVES.map((shelf) => (
              <ShelfTile
                key={shelf}
                label={SHELF_LABELS[shelf]}
                isbns={books.filter((book) => book.status === shelf).map((book) => book.isbn13)}
                onPress={() => openShelf(shelf)}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// Only the books that have a real cover go on the wall
const toWallCover = (book: LibraryBook): WallCover[] =>
  book.cover_url ? [{ isbn13: book.isbn13, coverUrl: book.cover_url }] : [];

function SectionHeader({ title, link }: { title: string; link?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {link && (
        <Pressable onPress={link.onPress} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.seeAll}>{link.label}</Text>
        </Pressable>
      )}
    </View>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.accentStrong,
  },
  avatarInitial: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  // The headline and the figures read as one introduction
  top: {
    gap: Space.gutter,
  },
  block: {
    gap: Space.block,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  seeAll: {
    color: Palette.accentStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  card: {
    borderRadius: 6,
    backgroundColor: Palette.accentSoft,
  },
  loading: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    gap: Space.item,
    padding: Space.card,
  },
  emptyTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptyBody: {
    marginBottom: Space.item,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  piles: {
    flexDirection: 'row',
    gap: Space.block,
  },
});
