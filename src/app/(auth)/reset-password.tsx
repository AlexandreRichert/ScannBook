import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { validateResetPassword, type ResetPasswordErrors } from '@/lib/ResetPasswordValidation';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { isRecovering, resetPassword, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reached by a refresh or a typed URL, without going through the email step
  if (!email) return <Redirect href="/forgot-password" />;

  const canSubmit = !isSubmitting && code.length > 0 && password.length > 0 && confirmation.length > 0;

  async function handleSubmit() {
    if (!canSubmit || !email) return;
    const errors = validateResetPassword({ code, password, confirmation });
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setError(await resetPassword(email, code, password));
    setIsSubmitting(false);
  }

  async function cancel() {
    // The code may already have opened a session, it must not survive a cancel
    if (isRecovering) await signOut();
    router.replace('/sign-in');
  }

  return (
    <AuthForm
      title="Nouveau mot de passe"
      subtitle={`Si un compte existe pour ${email}, tu vas recevoir un code par email.`}
      error={error}
      submitLabel={isSubmitting ? 'Enregistrement…' : 'Changer mon mot de passe'}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      footer={
        <ThemedText type="linkPrimary" onPress={cancel}>
          Annuler
        </ThemedText>
      }>
      <TextField
        label="Code reçu par email"
        value={code}
        onChangeText={setCode}
        error={fieldErrors.code}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        editable={!isRecovering}
      />
      <TextField
        label="Nouveau mot de passe"
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