import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

/** The app mark: three books in a viewfinder, crossed by the scan line. Decorative, the name is read from the text beside it. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/logo-mark.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Mark and name side by side. `onAccent` is for the tomato headers, where the name turns white. */
export function Logo({ onAccent = false }: { onAccent?: boolean }) {
  return (
    <View style={styles.logo}>
      <LogoMark />
      {/* 19 px bold: the smallest size at which white on tomato still passes as large text */}
      <Text style={[styles.name, onAccent && styles.nameOnAccent]}>ScannBook</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  nameOnAccent: {
    color: Palette.inkInverse,
  },
});
