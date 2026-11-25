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
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    default:
      return 'Une erreur est survenue. Vérifie ta connexion et réessaie.';
  }
}