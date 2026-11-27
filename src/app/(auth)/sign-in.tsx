import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLink, AuthPrompt } from '@/components/auth/AuthLink';
import { FieldIcons, TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { armReturnToBook, disarmReturnToBook } from '@/lib/ReturnAfterSignIn';

export default function SignInScreen() {
  const router = useRouter();
  // Set when a guest came from a book screen, to go back to it once signed in
  const { book } = useLocalSearchParams<{ book?: string }>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !isSubmitting && email.length > 0 && password.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    // Armed before the attempt: by the time signIn resolves, the session has already replaced this screen
    armReturnToBook(book);
    const failure = await signIn(email, password);
    if (failure) disarmReturnToBook();
    setError(failure);
    setIsSubmitting(false);
  }

  const continueAsGuest = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <AuthForm
      hero
      title="ScannBook"
      subtitle="Scanne, range, suis tes lectures."
      error={error}
      submitLabel={isSubmitting ? 'Connexion…' : 'Se connecter'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      footer={
        <>
          <AuthPrompt question="Pas encore de compte ?">
            <AuthLink href={{ pathname: '/sign-up', params: book ? { book } : {} }} label="Créer un compte" />
          </AuthPrompt>
          <AuthLink label="Continuer sans compte" tone="subtle" onPress={continueAsGuest} />
        </>
      }>
      <TextField
        label="Email"
        icon={FieldIcons.email}
        value={email}
        onChangeText={setEmail}
        placeholder="toi@exemple.fr"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Mot de passe"
        icon={FieldIcons.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        revealable
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.forgot}>
        <AuthLink href="/forgot-password" label="Mot de passe oublié ?" tone="subtle" />
      </View>
    </AuthForm>
  );
}
const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
  },
});
