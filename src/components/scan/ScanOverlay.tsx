import { SymbolView } from 'expo-symbols';
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
  /** ISBN-13 accepted by the last read; scanning is locked while it is set. */
  scannedIsbn: string | null;
  /** The last code read was an EAN-13 but not an ISBN. */
  rejected: boolean;
  onRescan: () => void;
  onManualEntry: () => void;
};

/** Everything drawn over the camera feed (Figma frame 03). */
export function ScanOverlay({
  torch,
  onToggleTorch,
  scannedIsbn,
  rejected,
  onRescan,
  onManualEntry,
}: ScanOverlayProps) {
  const insets = useSafeAreaInsets();
  const cornerColor = scannedIsbn ? C.scanLine : C.onCamera;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Top veil with the title and the torch */}
      <View style={[styles.veil, styles.top, { paddingTop: insets.top + 23 }]}>
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
          {!scannedIsbn && <View style={styles.scanLine} />}
        </View>
        <View style={styles.veil} />
      </View>

      {/* Bottom veil with the instructions, the result and the manual entry */}
      <View
        style={[styles.veil, styles.bottom, { paddingBottom: insets.bottom + BottomTabInset + 24 }]}>
        {scannedIsbn ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <Text style={styles.cardLabel}>ISBN détecté</Text>
            <Text style={styles.cardIsbn} selectable>
              {scannedIsbn}
            </Text>
            <Pressable
              onPress={onRescan}
              accessibilityRole="button"
              style={({ pressed }) => [styles.rescan, pressed && styles.pressed]}>
              <Text style={styles.rescanLabel}>Scanner à nouveau</Text>
            </Pressable>
          </View>
        ) : rejected ? (
          <View style={styles.rejected} accessibilityLiveRegion="polite">
            <Text style={styles.rejectedText}>Ce code-barres n’est pas un ISBN</Text>
          </View>
        ) : (
          <View style={styles.instructions}>
            <Text style={styles.instruction}>Placez le code-barres dans le cadre</Text>
            <Text style={styles.hint}>ISBN : EAN-13 commençant par 978 ou 979</Text>
          </View>
        )}

        {!scannedIsbn && (
          <Pressable
            onPress={onManualEntry}
            accessibilityRole="button"
            style={({ pressed }) => [styles.manualEntry, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
              size={18}
              tintColor={C.onCamera}
            />
            <Text style={styles.manualEntryLabel}>Saisir l’ISBN à la main</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    flex: 1,
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
  card: {
    alignSelf: 'stretch',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 17,
  },
  cardIsbn: {
    color: C.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rescan: {
    alignSelf: 'stretch',
    minHeight: 52,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanLabel: {
    color: C.onPrimary,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  manualEntry: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 240,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.onCameraControl,
  },
  manualEntryLabel: {
    color: C.onCamera,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
