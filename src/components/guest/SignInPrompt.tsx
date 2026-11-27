import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { SymbolViewProps } from 'expo-symbols';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

type SignInPromptProps = {
  icon: SymbolViewProps['name'];
  title: string;
  body: string;
};

/** Shown to a guest in place of a tab that needs an account. */
export function SignInPrompt({ icon, title, body }: SignInPromptProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + BottomTabInset + 24 },
      ]}>
      <StatusBar style="dark" />
      <BookStatus
        icon={icon}
        title={title}
        actions={
          <>
            <StatusButton label="Se connecter" onPress={() => router.push('/sign-in')} />
            <StatusButton label="Créer un compte" variant="secondary" onPress={() => router.push('/sign-up')} />
          </>
        }>
        <StatusText>{body}</StatusText>
      </BookStatus>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
});
