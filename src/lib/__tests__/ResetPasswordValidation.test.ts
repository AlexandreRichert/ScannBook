import { describe, expect, it } from '@jest/globals';

import { validateResetPassword, type ResetPasswordFields } from '@/lib/ResetPasswordValidation';
import { MIN_PASSWORD_LENGTH } from '@/lib/SignUpValidation';

const PASSWORD = 'a'.repeat(MIN_PASSWORD_LENGTH);

function fields(overrides: Partial<ResetPasswordFields> = {}): ResetPasswordFields {
  return { code: '123456', password: PASSWORD, confirmation: PASSWORD, ...overrides };
}

describe('validateResetPassword', () => {
  it('returns no errors for a valid form', () => {
    expect(validateResetPassword(fields())).toEqual({});
  });

  it('accepts a code with spaces around it, as pasted from an email', () => {
    expect(validateResetPassword(fields({ code: ' 123456 ' }))).toEqual({});
  });

  it.each(['', '   ', '12a456', '123 456', '-123456'])('rejects the code "%s"', (code) => {
    expect(validateResetPassword(fields({ code }))).toEqual({
      code: 'Saisis le code à chiffres reçu par email.',
    });
  });

  it('rejects a password shorter than MIN_PASSWORD_LENGTH', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);

    expect(validateResetPassword(fields({ password: short, confirmation: short }))).toEqual({
      password: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    });
  });

  it('rejects a confirmation that does not match', () => {
    expect(validateResetPassword(fields({ confirmation: `${PASSWORD}b` }))).toEqual({
      confirmation: 'Les mots de passe ne correspondent pas.',
    });
  });

  it('reports every invalid field at once', () => {
    expect(Object.keys(validateResetPassword({ code: '', password: 'abc', confirmation: '' })).sort()).toEqual([
      'code',
      'confirmation',
      'password',
    ]);
  });
});
