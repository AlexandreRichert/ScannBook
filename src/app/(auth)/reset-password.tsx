import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLink } from '@/components/auth/AuthLink';
import { FieldIcons, TextField } from '@/components/ui/TextField';
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
      footer={<AuthLink label="Annuler" onPress={cancel} />}>
      <TextField
        label="Code reçu par email"
        icon={FieldIcons.code}
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
        icon={FieldIcons.password}
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        hint="6 caractères minimum"
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