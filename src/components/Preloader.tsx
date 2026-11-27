import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Fonts, Palette } from '@/constants/theme';

const SPINES = [
  { color: '#2F4560', width: 16, height: 62 },
  { color: '#D9A814', width: 12, height: 50 },
  { color: '#B5532E', width: 18, height: 70 },
  { color: '#7C9A6A', width: 13, height: 46 },
  { color: '#7A2A30', width: 16, height: 58 },
];
const SPINE_GAP = 3;
const SHELF_PADDING = 14;
const SHELF_WIDTH =
  SPINES.reduce((total, spine) => total + spine.width, 0) + SPINE_GAP * (SPINES.length - 1) + 2 * SHELF_PADDING;
const SPINE_STAGGER_MS = 80;
const SCAN_DELAY_MS = 520;
const SCAN_MS = 620;
const LEAVE_DELAY_MS = 1500;
const LEAVE_MS = 320;

/**
 * Opening animation: books land on a shelf, a scan line crosses them, then the
 * screen fades into the app underneath. It covers the app from the first frame
 * and only plays once `ready`, so a half-loaded screen never shows through.
 */
export function Preloader({ ready }: { ready: boolean }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);

  useEffect(() => {
    if (!ready) return;
    // The native splash leaves only now, onto this overlay of the same color: nothing flashes between the two
    SplashScreen.hideAsync().finally(() => setStarted(true));
  }, [ready]);

  if (done) return null;

  return (
    <View style={styles.overlay} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {started && <Scene onDone={finish} />}
    </View>
  );
}

function Scene({ onDone }: { onDone: () => void }) {
  const leave = useSharedValue(0);
  const scan = useSharedValue(0);

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: 1 - leave.get(),
    transform: [{ scale: 1 + 0.04 * leave.get() }],
  }));
  const scanStyle = useAnimatedStyle(() => ({
    // Visible only while it travels, so it neither sits on the first book nor on the last
    opacity: scan.get() > 0 && scan.get() < 1 ? 1 : 0,
    transform: [{ translateX: scan.get() * (SHELF_WIDTH - 2) }],
  }));

  useEffect(() => {
    scan.set(withDelay(SCAN_DELAY_MS, withTiming(1, { duration: SCAN_MS, easing: Easing.inOut(Easing.cubic) })));
    leave.set(
      withDelay(
        LEAVE_DELAY_MS,
        withTiming(1, { duration: LEAVE_MS, easing: Easing.in(Easing.quad) }, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(onDone);
        }),
      ),
    );
    // Whatever happens to the animation, the app must never stay hidden behind this screen
    const fallback = setTimeout(onDone, LEAVE_DELAY_MS + LEAVE_MS + 600);
    return () => clearTimeout(fallback);
  }, [leave, scan, onDone]);

  return (
    <Animated.View style={[styles.scene, sceneStyle]}>
      <View>
        <View style={styles.spines}>
          {SPINES.map((spine, index) => (
            <Animated.View
              key={spine.color}
              entering={FadeInDown.delay(index * SPINE_STAGGER_MS)
                .springify()
                .damping(14)
                .stiffness(220)}
              style={[styles.spine, { width: spine.width, height: spine.height, backgroundColor: spine.color }]}
            />
          ))}
          <Animated.View style={[styles.scan, scanStyle]} />
        </View>
        <View style={styles.plank} />
      </View>
      <Animated.Text entering={FadeIn.delay(SCAN_DELAY_MS).duration(360)} style={styles.wordmark}>
        Scann<Text style={styles.wordmarkAccent}>Book</Text>
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: Palette.paper,
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    backgroundColor: Palette.paper,
  },
  spines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPINE_GAP,
    width: SHELF_WIDTH,
    height: 76,
    paddingHorizontal: SHELF_PADDING,
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(0, 0, 0, 0.34) 100%)',
  },
  scan: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
    backgroundColor: Palette.accent,
  },
  plank: {
    width: SHELF_WIDTH,
    height: 7,
    borderRadius: 2,
    backgroundColor: Palette.wood,
  },
  wordmark: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  wordmarkAccent: {
    color: Palette.accentStrong,
  },
});
