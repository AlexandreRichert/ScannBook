import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { ScanScreenColors as C } from '@/constants/ScanScreenColors';
import { BottomTabInset, Fonts } from '@/constants/theme';

const FRAME_WIDTH = 302;
const FRAME_HEIGHT = 170;
const FRAME_RADIUS = 12;
const CORNER_SIZE = 36;
// The line sweeps between these insets so it never touches the corner strokes
const LINE_INSET = 18;
const CORNER_STROKE = 3;
const CORNER_RADIUS = FRAME_RADIUS + CORNER_STROKE / 2;

type ScanOverlayProps = {
  torch: boolean;
  onToggleTorch: () => void;
  /** A valid ISBN was read and the book screen is opening. */
  locked: boolean;
  /** The last code read was an EAN-13 but not an ISBN. */
  rejected: boolean;
  onManualEntry: () => void;
  onSearch: () => void;
};

/** Everything drawn over the camera feed (Figma frame 03). */
export function ScanOverlay({
  torch,
  onToggleTorch,
  locked,
  rejected,
  onManualEntry,
  onSearch,
}: ScanOverlayProps) {
  const insets = useSafeAreaInsets();

  const cornerStyle = [styles.corner, locked && styles.cornerFound];

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.section, styles.top, { paddingTop: insets.top + 6 }]}>
        <View style={styles.header}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            Scanner un livre
          </Text>
          <Pressable
            onPress={onToggleTorch}
            accessibilityRole="switch"
            accessibilityLabel="Lampe"
            accessibilityState={{ checked: torch }}
            hitSlop={8}
            style={({ pressed }) => [styles.torch, torch && styles.torchOn, pressed && styles.pressed]}>
            <SymbolView
              name={
                torch
                  ? { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' }
                  : { ios: 'bolt', android: 'flash_off', web: 'flash_off' }
              }
              size={20}
              tintColor={torch ? C.primary : C.onCamera}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.frameRow}>
        {/* The veil is the frame's spread shadow: it follows the rounded corners,
            which a grid of veil Views around a clear hole cannot do. */}
        <View style={styles.frame}>
          <View style={[cornerStyle, styles.topLeft]} />
          <View style={[cornerStyle, styles.topRight]} />
          <View style={[cornerStyle, styles.bottomLeft]} />
          <View style={[cornerStyle, styles.bottomRight]} />
          {!locked && <ScanLine />}
        </View>
      </View>

      <View
        style={[styles.section, styles.bottom, { paddingBottom: insets.bottom + BottomTabInset + 24 }]}>
        {locked ? (
          <Animated.View entering={FadeIn.duration(150)} style={[styles.pill, styles.found]} accessibilityLiveRegion="polite">
            <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={16} tintColor={C.text} />
            <Text style={[styles.pillText, styles.foundText]}>Livre trouvé</Text>
          </Animated.View>
        ) : rejected ? (
          <Animated.View entering={FadeIn.duration(150)} style={[styles.pill, styles.rejected]} accessibilityLiveRegion="polite">
            <Text style={styles.pillText}>Ce code-barres n’est pas un ISBN</Text>
          </Animated.View>
        ) : (
          <View style={styles.instructions}>
            <Text style={styles.instruction}>Place le code-barres dans le cadre</Text>
            <Text style={styles.hint}>ISBN : EAN-13 commençant par 978 ou 979</Text>
          </View>
        )}

        <View style={styles.actions}>
          <OverlayButton
            icon={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
            label="Saisir l’ISBN à la main"
            hint="Ouvre la saisie de l’ISBN au clavier"
            disabled={locked}
            onPress={onManualEntry}
          />
          <OverlayButton
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            label="Rechercher un livre"
            hint="Ouvre la recherche par titre ou auteur"
            disabled={locked}
            onPress={onSearch}
          />
        </View>
      </View>
    </View>
  );
}

type OverlayButtonProps = {
  icon: SymbolViewProps['name'];
  label: string;
  /** What happens on press, read after the label by screen readers. */
  hint: string;
  /** While a scanned book is opening. */
  disabled: boolean;
  onPress: () => void;
};

/** Dark button over the camera feed. The icon is decorative: only the label is read. */
function OverlayButton({ icon, label, hint, disabled, onPress }: OverlayButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={[styles.overlayButton, disabled && styles.disabled]}>
      <SymbolView name={icon} size={18} tintColor={C.onCamera} />
      <Text style={styles.overlayButtonLabel}>{label}</Text>
    </PressableScale>
  );
}

/** Laser line sweeping the frame, so the screen reads as looking for a code rather than frozen. */
function ScanLine() {
  const progress = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: LINE_INSET + progress.get() * (FRAME_HEIGHT - 2 * LINE_INSET) }],
  }));

  useEffect(() => {
    progress.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [progress]);

  return <Animated.View style={[styles.scanLine, style]} />;
}

const styles = StyleSheet.create({
  // Above the frame, whose spread shadow would otherwise cover them. Never smaller than
  // their content, so the buttons can't slide under the tab bar on a small screen or with large text.
  section: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    zIndex: 1,
    paddingHorizontal: 24,
  },
  top: {
    justifyContent: 'flex-start',
  },
  header: {
    height: 44,
    justifyContent: 'center',
  },
  screenTitle: {
    color: C.onCamera,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  torch: {
    position: 'absolute',
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.onCameraControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchOn: {
    backgroundColor: C.onCamera,
  },
  frameRow: {
    height: FRAME_HEIGHT,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    maxWidth: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: FRAME_RADIUS,
    boxShadow: `0 0 0 2000px ${C.veil}`,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: C.viewfinder,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderTopRightRadius: CORNER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  cornerFound: {
    borderColor: C.onCamera,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.viewfinder,
    boxShadow: `0 0 10px ${C.scanLineGlow}`,
  },
  bottom: {
    alignItems: 'center',
    paddingTop: 34,
  },
  instructions: {
    alignItems: 'center',
    gap: 6,
  },
  instruction: {
    color: C.onCamera,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
    textAlign: 'center',
  },
  hint: {
    color: C.onCameraSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rejected: {
    backgroundColor: C.error,
  },
  found: {
    backgroundColor: C.onCamera,
  },
  foundText: {
    color: C.text,
  },
  pillText: {
    color: C.onCamera,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
    textAlign: 'center',
  },
  // `auto` pushes the buttons down; the padding keeps them off the text when space runs short.
  actions: {
    marginTop: 'auto',
    paddingTop: 24,
    gap: 12,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 240,
    height: 48,
    borderRadius: 4,
    backgroundColor: C.onCameraButton,
    borderWidth: 1,
    borderColor: C.onCameraButtonBorder,
  },
  overlayButtonLabel: {
    color: C.onCamera,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
