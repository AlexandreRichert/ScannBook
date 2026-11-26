import { router } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLink } from '@/components/auth/AuthLink';
import { FieldIcons, TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !isSubmitting && email.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const message = await requestPasswordReset(email);
    setIsSubmitting(false);
    setError(message);
    if (!message) router.push({ pathname: '/reset-password', params: { email: email.trim() } });
  }

  function goToSignIn() {
    if (router.canGoBack()) router.back();
    else router.replace('/sign-in');
  }

  return (
    <AuthForm
      title="Mot de passe oublié ?"
      subtitle="Saisis ton email, on t'envoie un code pour choisir un nouveau mot de passe."
      error={error}
      submitLabel={isSubmitting ? 'Envoi…' : 'Recevoir un code'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      back={{ label: 'Connexion', onPress: goToSignIn }}
      footer={<AuthLink label="Retour à la connexion" onPress={goToSignIn} />}>
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
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
    </AuthForm>
  );
}