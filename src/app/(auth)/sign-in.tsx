import { Link } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/TextField';
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
      title="Connexion"
      subtitle="Retrouve tes piles de lecture."
      error={error}
      submitLabel={isSubmitting ? 'Connexion…' : 'Se connecter'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      footer={
        <ThemedText type="small">
          Pas encore de compte ?{' '}
          <Link href="/sign-up">
            <ThemedText type="linkPrimary">Créer un compte</ThemedText>
          </Link>
        </ThemedText>
      }>
      <TextField
        label="Email"
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
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
    </AuthForm>
  );
}