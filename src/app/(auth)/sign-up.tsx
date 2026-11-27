import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLink, AuthPrompt } from '@/components/auth/AuthLink';
import { FieldIcons, TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { armReturnToBook, disarmReturnToBook } from '@/lib/ReturnAfterSignIn';
import { MIN_PASSWORD_LENGTH, validateSignUp, type SignUpErrors } from '@/lib/SignUpValidation';

export default function SignUpScreen() {
  const { book } = useLocalSearchParams<{ book?: string }>();
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
    armReturnToBook(book);
    const failure = await signUp(email, password);
    if (failure) disarmReturnToBook();
    setError(failure);
    setIsSubmitting(false);
  }

  function goToSignIn() {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/sign-in', params: book ? { book } : {} });
  }

  return (
    <AuthForm
      title="Créer un compte"
      subtitle="Ton espace personnel pour tes piles de lecture."
      error={error}
      submitLabel={isSubmitting ? 'Création…' : 'Créer mon compte'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      back={{ label: 'Connexion', onPress: goToSignIn }}
      footer={
        <>
          <AuthPrompt question="Déjà inscrit ?">
            <AuthLink label="Se connecter" onPress={goToSignIn} />
          </AuthPrompt>
          <AuthPrompt question="Ce qu’on fait de tes données :">
            <AuthLink
              label="confidentialité"
              tone="subtle"
              href={{ pathname: '/legal', params: { page: 'confidentialite' } }}
            />
          </AuthPrompt>
        </>
      }>
      <TextField
        label="Email"
        icon={FieldIcons.email}
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
        icon={FieldIcons.password}
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        hint={`${MIN_PASSWORD_LENGTH} caractères minimum`}
        secureTextEntry
        revealable
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirmer le mot de passe"
        icon={FieldIcons.password}
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