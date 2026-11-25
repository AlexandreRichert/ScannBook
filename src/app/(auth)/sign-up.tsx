import { router } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { validateSignUp, type SignUpErrors } from '@/lib/SignUpValidation';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignUpErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !isSubmitting && email.length > 0 && password.length > 0 && confirmation.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    const errors = validateSignUp({ email, password, confirmation });
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setError(await signUp(email, password));
    setIsSubmitting(false);
  }

  function goToSignIn() {
    if (router.canGoBack()) router.back();
    else router.replace('/sign-in');
  }

  return (
    <AuthForm
      title="Créer un compte"
      subtitle="Ton espace personnel pour tes piles de lecture."
      error={error}
      submitLabel={isSubmitting ? 'Création…' : 'Créer mon compte'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      footer={
        <ThemedText type="small">
          Déjà un compte ?{' '}
          <ThemedText type="linkPrimary" onPress={goToSignIn}>
            Se connecter
          </ThemedText>
        </ThemedText>
      }>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        placeholder="toi@exemple.fr"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        placeholder="6 caractères minimum"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirmation du mot de passe"
        value={confirmation}
        onChangeText={setConfirmation}
        error={fieldErrors.confirmation}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
    </AuthForm>
  );
}