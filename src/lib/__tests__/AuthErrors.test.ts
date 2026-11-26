import { describe, expect, it } from '@jest/globals';

import { authErrorMessage } from '@/lib/AuthErrors';
import { MIN_PASSWORD_LENGTH } from '@/lib/SignUpValidation';

const DEFAULT_MESSAGE = 'Une erreur est survenue. Vérifie ta connexion et réessaie.';

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'Email ou mot de passe incorrect.'],
    ['user_already_exists', 'Un compte existe déjà avec cet email.'],
    ['email_exists', 'Un compte existe déjà avec cet email.'],
    ['email_address_invalid', 'Adresse email invalide.'],
    ['validation_failed', 'Adresse email invalide.'],
    ['weak_password', 'Le mot de passe doit contenir au moins 6 caractères.'],
    ['otp_expired', 'Code invalide ou expiré. Redemande un code.'],
    ['same_password', 'Choisis un mot de passe différent de l’ancien.'],
    ['over_email_send_rate_limit', 'Trop de tentatives. Réessaie dans quelques minutes.'],
    ['over_request_rate_limit', 'Trop de tentatives. Réessaie dans quelques minutes.'],
  ])('translates "%s"', (code, expected) => {
    expect(authErrorMessage(code)).toBe(expected);
  });

  it.each([
    ['an unknown code', 'some_new_supabase_code'],
    ['an empty code', ''],
    ['no code', undefined],
  ])('falls back to a generic message for %s', (_, code) => {
    expect(authErrorMessage(code)).toBe(DEFAULT_MESSAGE);
  });

  // The Supabase message hardcodes the length: it must stay in line with the form check.
  it('gives the same minimum length as the sign-up form for "weak_password"', () => {
    expect(authErrorMessage('weak_password')).toContain(`${MIN_PASSWORD_LENGTH} caractères`);
  });
});
