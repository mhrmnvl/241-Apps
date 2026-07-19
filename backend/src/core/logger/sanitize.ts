const SENSITIVE_FIELDS = new Set([
  'password',
  'newPassword',
  'confirmPassword',
  'token',
  'refreshToken',
  'refresh_token',
  'accessToken',
  'access_token',
  'authorization',
  'secret',
  'creditCard',
  'cvv',
]);

const REDACTED = '[REDACTED]';

export function sanitize(
  data: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = SENSITIVE_FIELDS.has(key) ? REDACTED : value;
  }

  return sanitized;
}
