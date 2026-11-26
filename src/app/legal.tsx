import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import { LEGAL_DOCUMENTS, type LegalPage } from '@/lib/Legal';

/** Legal notice or privacy policy, reachable signed in (profile) and signed out (sign-up). */
export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { page } = useLocalSearchParams<{ page?: string }>();
  const document = LEGAL_DOCUMENTS[(page === 'confidentialite' ? page : 'mentions') satisfies LegalPage];

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}>
      <StatusBar style="dark" />
      <Pressable
        onPress={back}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={18}
          tintColor={Palette.ink}
        />
        <Text style={styles.backLabel}>Retour</Text>
      </Pressable>

      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">
          {document.title}
        </Text>
        <Text style={styles.updated}>Mise à jour le {document.updatedOn}</Text>
      </View>

      {document.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.caps} accessibilityRole="header">
            {section.title}
          </Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    gap: 24,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginLeft: -6,
  },
  pressed: {
    opacity: 0.6,
  },
  backLabel: {
    color: Palette.ink,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    gap: 4,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  updated: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 8,
  },
  caps: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  paragraph: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
