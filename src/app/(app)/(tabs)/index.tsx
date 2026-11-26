import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { EmptyStage } from '@/components/home/EmptyStage';
import { ReadingCarousel, STAGE_HEIGHT } from '@/components/home/ReadingCarousel';
import { ShelfTile } from '@/components/home/ShelfTile';
import { ProgressBar } from '@/components/library/ProgressBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { BottomTabInset, Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { profileName } from '@/lib/ProfileName';
import { progressRatio } from '@/lib/ReadingProgress';
import { SHELF_LABELS, type Shelf } from '@/lib/Shelves';

const OTHER_SHELVES: Shelf[] = ['to_read', 'wishlist', 'read', 'abandoned'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { firstName } = profileName(session?.user);
  const initial = (firstName[0] ?? session?.user.email?.[0] ?? '?').toUpperCase();
  const { state, retry } = useLibrary();
  const [index, setIndex] = useState(0);

  const books = state.status === 'success' ? state.books : [];
  const reading = books.filter((book) => book.status === 'reading');
  const active = Math.min(index, reading.length - 1);
  const current = reading[active];
  const isNewcomer = state.status === 'success' && books.length === 0;

  const openShelf = (shelf: Shelf) => router.push({ pathname: '/shelf/[shelf]', params: { shelf } });
  const scan = () => router.navigate('/scan');


  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + BottomTabInset + 24 }}>
      <StatusBar style="dark" />
      <View style={[styles.section, styles.header]}>
        <View>
          <Text style={styles.greeting}>
            {isNewcomer ? 'Bienvenue' : greeting(new Date())}
            {firstName ? ` ${firstName}` : ''}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {current ? 'On reprend ?' : 'On commence ?'}
          </Text>
        </View>
        <PressableScale
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Mon profil"
          pressedScale={0.92}
          style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </PressableScale>
      </View>

      <View style={styles.stage}>
        <View style={styles.light} />
        {state.status === 'loading' && (
          <ActivityIndicator style={styles.loader} color={Palette.ink} accessibilityLabel="Chargement de tes lectures" />
        )}
        {state.status === 'success' &&
          (current ? (
            <ReadingCarousel books={reading} onIndexChange={setIndex} />
          ) : (
            <EmptyStage
              onPress={isNewcomer ? scan : () => openShelf('to_read')}
              label={isNewcomer ? 'Scanner un livre' : 'Voir ma pile À lire'}
            />
          ))}
      </View>
      <View style={styles.shelf} />

      {state.status === 'error' && (
        <BookStatus
          icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
          tone="error"
          title="Lectures indisponibles"
          actions={<StatusButton label="Réessayer" onPress={retry} />}>
          <StatusText>Vérifie ta connexion et réessaie.</StatusText>
        </BookStatus>
      )}

      {state.status === 'success' && (
        <Animated.View entering={FadeIn.duration(250)}>
          <View style={[styles.section, styles.focus]}>
            {current ? (
              <>
                {reading.length > 1 && (
                  <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    {reading.map((book, position) => (
                      <View key={book.id} style={[styles.dot, position === active && styles.dotActive]} />
                    ))}
                  </View>
                )}
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {current.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {current.authors.length > 0 ? current.authors.join(', ') : 'Auteur inconnu'}
                </Text>
                {current.page_count !== null && (
                  <View style={styles.progress}>
                    <Text style={styles.page}>
                      page {current.current_page ?? 0} sur {current.page_count}
                    </Text>
                    <View style={styles.bar}>
                      <ProgressBar ratio={progressRatio(current.current_page, current.page_count)} />
                    </View>
                    <Text style={styles.percent}>
                      {Math.round(progressRatio(current.current_page, current.page_count) * 100)} %
                    </Text>
                  </View>
                )}
                <PrimaryAction label="Reprendre la lecture" onPress={() => router.push(`/book/${current.isbn13}`)} />
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>{isNewcomer ? 'Aucun livre ici' : 'Aucune lecture en cours'}</Text>
                <Text style={styles.emptyBody}>
                  {isNewcomer
                    ? 'Scanne le code-barres d’un livre pour commencer ta pile.'
                    : 'Choisis ton prochain livre dans ta pile À lire.'}
                </Text>
                {isNewcomer ? (
                  <PrimaryAction label="Scanner un livre" icon onPress={scan} />
                ) : (
                  <PrimaryAction label="Voir ma pile À lire" onPress={() => openShelf('to_read')} />
                )}
              </>
            )}
          </View>

          {/* Four empty piles teach nothing to a newcomer, the scan call to action is enough */}
          {!isNewcomer && (
            <View style={styles.section}>
              <View style={styles.pilesHeader}>
                <Text style={styles.pilesTitle}>{current ? 'Mes autres piles' : 'Mes piles'}</Text>
                <Pressable onPress={() => router.navigate('/library')} accessibilityRole="link" hitSlop={8}>
                  <Text style={styles.seeAll}>Tout voir</Text>
                </Pressable>
              </View>
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
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}

function greeting(now: Date): string {
  return now.getHours() >= 18 || now.getHours() < 5 ? 'Bonsoir' : 'Bonjour';
}

function PrimaryAction({ label, onPress, icon = false }: { label: string; onPress: () => void; icon?: boolean }) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={styles.action}>
      {icon && (
        <SymbolView
          name={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
          size={20}
          tintColor={Palette.inkInverse}
        />
      )}
      <Text style={styles.actionLabel}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  section: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  title: {
    marginTop: 4,
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  stage: {
    height: STAGE_HEIGHT,
    marginTop: 16,
    overflow: 'hidden',
  },
  light: {
    position: 'absolute',
    alignSelf: 'center',
    top: -20,
    width: 440,
    height: 400,
    experimental_backgroundImage:
      'radial-gradient(ellipse closest-side, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 100%)',
  },
  loader: {
    flex: 1,
  },
  shelf: {
    height: 8,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  focus: {
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.ink,
    opacity: 0.25,
  },
  dotActive: {
    width: 18,
    backgroundColor: Palette.accent,
    opacity: 1,
  },
  bookTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  bookAuthor: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  page: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  bar: {
    width: 130,
  },
  percent: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  emptyTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  emptyBody: {
    maxWidth: 280,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
    height: 48,
    marginTop: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    backgroundColor: Palette.ink,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  actionLabel: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  pilesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 28,
    marginBottom: 10,
  },
  pilesTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  seeAll: {
    color: Palette.accentStrong,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  piles: {
    flexDirection: 'row',
    gap: 14,
  },
});
