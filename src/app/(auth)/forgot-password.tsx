import { router } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/TextField';
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

  return (
    <AuthForm
      title="Mot de passe oublié"
      subtitle="Saisis ton email, on t'envoie un code pour choisir un nouveau mot de passe."
      error={error}
      submitLabel={isSubmitting ? 'Envoi…' : 'Recevoir un code'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      footer={
        <ThemedText type="linkPrimary" onPress={() => router.back()}>
          Retour à la connexion
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
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
    </AuthForm>
  );
}