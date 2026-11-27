import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, Space } from '@/constants/theme';

/** Invitation to scan a new book, as one large button. */
export function ScanCard({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel="Scanner un livre"
      style={styles.card}>
      <View style={styles.icon}>
        <SymbolView
          name={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
          size={26}
          tintColor={Palette.accentStrong}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Un nouveau livre ?</Text>
        <Text style={styles.body}>Scanne son code-barres pour l’ajouter à tes piles.</Text>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={Palette.inkInverse}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  // The darker accent: white text on it is 5.3:1, readable at any size
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.card,
    padding: Space.card,
    borderRadius: 6,
    backgroundColor: Palette.accentStrong,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paperRaised,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    color: Palette.inkInverse,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
