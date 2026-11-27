import { MIN_PASSWORD_LENGTH } from '@/lib/SignUpValidation';

// Supabase error codes are stable, but the messages are not. This function maps error codes to user-friendly messages.
export function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Email ou mot de passe incorrect.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cet email.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Adresse email invalide.';
    case 'weak_password':
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    case 'otp_expired':
      return 'Code invalide ou expiré. Redemande un code.';
    case 'same_password':
      return 'Choisis un mot de passe différent de l’ancien.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Réessaie dans quelques minutes.';
    default:
      return 'Une erreur est survenue. Vérifie ta connexion et réessaie.';
  }
}