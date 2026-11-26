import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { ART_WIDTH, ProgressArt, ScanArt, ShelvesArt } from '@/components/onboarding/OnboardingArt';
import { Fonts, Palette } from '@/constants/theme';

const STEPS: { title: string; body: string; art: ReactNode }[] = [
  {
    title: 'Scanne le code-barres',
    body: 'Vise le dos du livre : titre, auteur et couverture se remplissent tout seuls.',
    art: <ScanArt />,
  },
  {
    title: 'Range par piles',
    body: 'À lire, en cours, lu, envies : chaque livre trouve sa place sur ton étagère.',
    art: <ShelvesArt />,
  },
  {
    title: 'Suis tes lectures',
    body: 'Note la page où tu t’arrêtes et retrouve ta progression d’un coup d’œil.',
    art: <ProgressArt />,
  },
];

// Mockup 18: the tomato stage is 414 pt tall under the status bar
const ART_HEIGHT = 414;
// Room left for the step text, the dots and the button below the stage
const TEXT_AREA = 360;

/** « Premiers pas » (Figma frames 18, 18b, 18c), shown once over the app after the first sign-in. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  // Measured rather than read from the window, which is 0 on the first web render
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  const [index, setIndex] = useState(0);
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  // Page the « Continuer » animation is heading to, so its intermediate offsets do not move the dots back
  const target = useRef<number | null>(null);
  const artHeight = Math.max(Math.min(ART_HEIGHT, height - insets.top - insets.bottom - TEXT_AREA), 240);
  const isLast = index === STEPS.length - 1;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    if (nextWidth !== width || nextHeight !== height) setSize({ width: nextWidth, height: nextHeight });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    if (target.current !== null) {
      if (page !== target.current) return;
      target.current = null;
    }
    if (page !== index) setIndex(page);
  };

  const next = () => {
    if (isLast) return onDone();
    target.current = index + 1;
    pager.current?.scrollTo({ x: (index + 1) * width, animated: true });
    setIndex(index + 1);
  };

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <StatusBar style="light" />
      {width > 0 && (
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}>
          {STEPS.map((step, stepIndex) => (
            <View key={step.title} style={{ width }}>
              <View style={[styles.stage, { paddingTop: insets.top }]}>
                <View style={styles.light} />
                <View
                  style={[styles.art, { height: artHeight }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants">
                  {step.art}
                </View>
              </View>
              <View style={styles.plank} />
              <View style={styles.text}>
                <Text style={styles.caps}>
                  Étape {stepIndex + 1} sur {STEPS.length}
                </Text>
                <Text style={styles.title} accessibilityRole="header">
                  {step.title}
                </Text>
                <Text style={styles.body}>{step.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        accessibilityLabel="Passer la présentation"
        hitSlop={12}
        style={({ pressed }) => [styles.skip, { top: insets.top + 14 }, pressed && styles.pressed]}>
        <Text style={styles.skipLabel}>Passer</Text>
      </Pressable>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {STEPS.map((step, dotIndex) => (
            <View key={step.title} style={[styles.dot, dotIndex === index && styles.dotActive]} />
          ))}
        </View>
        <AuthButton
          label={isLast ? 'Commencer' : 'Continuer'}
          icon={isLast ? undefined : { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
          onPress={next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.paper,
  },
  stage: {
    overflow: 'hidden',
    backgroundColor: Palette.accent,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  light: {
    position: 'absolute',
    alignSelf: 'center',
    top: -150,
    width: 600,
    height: 600,
    experimental_backgroundImage:
      'radial-gradient(circle closest-side, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
  },
  art: {
    width: ART_WIDTH,
    alignSelf: 'center',
  },
  plank: {
    height: 9,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 30%, rgba(0, 0, 0, 0.2) 100%)',
  },
  text: {
    gap: 10,
    paddingTop: 22,
    paddingHorizontal: 24,
  },
  caps: {
    color: Palette.accentStrong,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  body: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  skip: {
    position: 'absolute',
    right: 24,
  },
  skipLabel: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 24,
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.lineStrong,
  },
  dotActive: {
    width: 18,
    opacity: 1,
    backgroundColor: Palette.accent,
  },
});
