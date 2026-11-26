import { MIN_PASSWORD_LENGTH } from '@/lib/SignUpValidation';

export type ResetPasswordFields = { code: string; password: string; confirmation: string };
export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordFields, string>>;

export function validateResetPassword({ code, password, confirmation }: ResetPasswordFields): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};
  if (!/^\d+$/.test(code.trim())) {
    errors.code = 'Saisis le code à chiffres reçu par email.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (confirmation !== password) {
    errors.confirmation = 'Les mots de passe ne correspondent pas.';
  }
  return errors;
}