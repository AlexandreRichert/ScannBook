import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';
import { ScanScreenColors as C } from '@/constants/ScanScreenColors';

const FRAME_WIDTH = 300;
const FRAME_HEIGHT = 180;
const CORNER_SIZE = 40;
const CORNER_STROKE = 4;
const CORNER_RADIUS = 14;

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
  const cornerColor = locked ? C.scanLine : C.onCamera;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Top veil with the title and the torch */}
      <View style={[styles.band, styles.top, { paddingTop: insets.top + 23 }]}>
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
            style={({ pressed }) => [styles.torch, pressed && styles.pressed]}>
            <SymbolView
              name={
                torch
                  ? { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' }
                  : { ios: 'bolt', android: 'flash_off', web: 'flash_off' }
              }
              size={20}
              tintColor={C.onCamera}
            />
          </Pressable>
        </View>
      </View>

      {/* Viewfinder row: veil | clear frame | veil */}
      <View style={styles.frameRow}>
        <View style={styles.veil} />
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft, { borderColor: cornerColor }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: cornerColor }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: cornerColor }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: cornerColor }]} />
          {!locked && <View style={styles.scanLine} />}
        </View>
        <View style={styles.veil} />
      </View>

      {/* Bottom veil with the instructions, the result and the other ways to find a book */}
      <View
        style={[styles.band, styles.bottom, { paddingBottom: insets.bottom + BottomTabInset + 24 }]}>
        {rejected ? (
          <View style={styles.rejected} accessibilityLiveRegion="polite">
            <Text style={styles.rejectedText}>Ce code-barres n’est pas un ISBN</Text>
          </View>
        ) : (
          <View style={styles.instructions}>
            <Text style={styles.instruction}>Placez le code-barres dans le cadre</Text>
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

/** Dark pill over the camera feed. The icon is decorative: only the label is read. */
function OverlayButton({ icon, label, hint, disabled, onPress }: OverlayButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.overlayButton, (pressed || disabled) && styles.pressed]}>
      <SymbolView name={icon} size={18} tintColor={C.onCamera} />
      <Text style={styles.overlayButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  veil: {
    flex: 1,
    backgroundColor: C.veil,
  },
  // Top and bottom veils: never smaller than their content, then they share the space left.
  // The buttons can't slide under the tab bar, whatever the screen or text size.
  band: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    backgroundColor: C.veil,
  },
  top: {
    paddingHorizontal: 24,
  },
  header: {
    height: 40,
    justifyContent: 'center',
  },
  screenTitle: {
    color: C.onCamera,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  torch: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.onCameraControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameRow: {
    flexDirection: 'row',
    height: FRAME_HEIGHT,
  },
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
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
  scanLine: {
    width: FRAME_WIDTH - 40,
    height: 2,
    backgroundColor: C.scanLine,
  },
  bottom: {
    alignItems: 'center',
    paddingTop: 34,
    paddingHorizontal: 24,
  },
  instructions: {
    alignItems: 'center',
    gap: 7,
  },
  instruction: {
    color: C.onCamera,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: C.onCameraSecondary,
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
  },
  rejected: {
    backgroundColor: C.error,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rejectedText: {
    color: C.onCamera,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  // `auto` pushes the buttons down; the padding keeps them off the text when space runs short.
  actions: {
    marginTop: 'auto',
    paddingTop: 24,
    gap: 16,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 240,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.onCameraButton,
    borderWidth: 1,
    borderColor: C.onCameraButtonBorder,
  },
  overlayButtonLabel: {
    color: C.onCamera,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
