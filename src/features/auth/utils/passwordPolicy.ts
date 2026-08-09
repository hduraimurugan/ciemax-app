/**
 * Mirrors cinema-hall-api's utils/passwordPolicy.js exactly — the server
 * rejects anything that fails these rules, so the client checklist must
 * agree with it rule-for-rule or a "valid-looking" password can still 400.
 */
export interface PasswordRule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'length', label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: p => /[a-z]/.test(p) },
  { key: 'digit', label: 'One number', test: p => /\d/.test(p) },
  {
    key: 'special',
    label: 'One special character',
    test: p => /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/.test(p),
  },
];

export function evaluatePassword(password: string): Array<PasswordRule & { passed: boolean }> {
  return PASSWORD_RULES.map(rule => ({ ...rule, passed: rule.test(password) }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every(rule => rule.test(password));
}
