import { describe, expect, it } from '@jest/globals';

import { MIN_PASSWORD_LENGTH, validateSignUp, type SignUpFields } from '@/lib/SignUpValidation';

const PASSWORD = 'a'.repeat(MIN_PASSWORD_LENGTH);

function fields(overrides: Partial<SignUpFields> = {}): SignUpFields {
  return { email: 'jeanne@example.com', password: PASSWORD, confirmation: PASSWORD, ...overrides };
}

describe('validateSignUp', () => {
  it('returns no errors for a valid form', () => {
    expect(validateSignUp(fields())).toEqual({});
  });

  it('accepts an email with spaces around it', () => {
    expect(validateSignUp(fields({ email: '  jeanne@example.com  ' }))).toEqual({});
  });

  it.each(['', 'jeanne', 'jeanne@', 'jeanne@example', '@example.com', 'jeanne @example.com'])(
    'rejects the email "%s"',
    (email) => {
      expect(validateSignUp(fields({ email }))).toEqual({ email: 'Adresse email invalide.' });
    },
  );

  it('rejects a password shorter than MIN_PASSWORD_LENGTH', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);

    expect(validateSignUp(fields({ password: short, confirmation: short }))).toEqual({
      password: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    });
  });

  it('accepts a password of exactly MIN_PASSWORD_LENGTH characters', () => {
    expect(validateSignUp(fields()).password).toBeUndefined();
  });

  it.each(['', `${PASSWORD}b`, PASSWORD.toUpperCase()])('rejects the confirmation "%s"', (confirmation) => {
    expect(validateSignUp(fields({ confirmation }))).toEqual({
      confirmation: 'Les mots de passe ne correspondent pas.',
    });
  });

  it('reports every invalid field at once', () => {
    expect(Object.keys(validateSignUp({ email: '', password: 'abc', confirmation: '' })).sort()).toEqual([
      'confirmation',
      'email',
      'password',
    ]);
  });
});
