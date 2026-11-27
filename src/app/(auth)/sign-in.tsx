import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLink, AuthPrompt } from '@/components/auth/AuthLink';
import { FieldIcons, TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !isSubmitting && email.length > 0 && password.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(await signIn(email, password));
    setIsSubmitting(false);
  }

  return (
    <AuthForm
      hero
      title="Pile à lire"
      subtitle="Scanne, range, suis tes lectures."
      error={error}
      submitLabel={isSubmitting ? 'Connexion…' : 'Se connecter'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitTestID="sign-in-submit"
      footer={
        <AuthPrompt question="Pas encore de compte ?">
          <AuthLink href="/sign-up" label="Créer un compte" />
        </AuthPrompt>
      }>
      <TextField
        testID="sign-in-email"
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
        testID="sign-in-password"
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
