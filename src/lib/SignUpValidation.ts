export type SignUpFields = { email: string; password: string; confirmation: string };
export type SignUpErrors = Partial<Record<keyof SignUpFields, string>>;

export const MIN_PASSWORD_LENGTH = 6;

// Deliberately loose: Supabase does the real check, this only catches obvious typos
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp({ email, password, confirmation }: SignUpFields): SignUpErrors {
  const errors: SignUpErrors = {};
  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Adresse email invalide.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (confirmation !== password) {
    errors.confirmation = 'Les mots de passe ne correspondent pas.';
  }
  return errors;
}