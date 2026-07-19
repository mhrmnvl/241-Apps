import type { TransformFnParams } from 'class-transformer';
import { toBoolean, toBooleanFromTransform } from './boolean.transformer.js';

describe('toBoolean', () => {
  it('should return undefined for undefined', () => {
    expect(toBoolean(undefined)).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(toBoolean(null)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(toBoolean('')).toBeUndefined();
  });

  it('should return true for boolean true', () => {
    expect(toBoolean(true)).toBe(true);
  });

  it('should return false for boolean false', () => {
    expect(toBoolean(false)).toBe(false);
  });

  it('should return true for string "true"', () => {
    expect(toBoolean('true')).toBe(true);
  });

  it('should return true for string "1"', () => {
    expect(toBoolean('1')).toBe(true);
  });

  it('should return true for string "TRUE" (case-insensitive)', () => {
    expect(toBoolean('TRUE')).toBe(true);
  });

  it('should return false for string "false"', () => {
    expect(toBoolean('false')).toBe(false);
  });

  it('should return false for string "0"', () => {
    expect(toBoolean('0')).toBe(false);
  });

  it('should return false for string "FALSE" (case-insensitive)', () => {
    expect(toBoolean('FALSE')).toBe(false);
  });

  it('should return original value for unrecognized string', () => {
    expect(toBoolean('maybe')).toBe('maybe');
  });

  it('should return original value for number', () => {
    expect(toBoolean(42)).toBe(42);
  });
});

const makeParams = (
  key: string,
  value: unknown,
  obj: Record<string, unknown> | undefined,
): TransformFnParams => ({
  value,
  key,
  obj: obj!,
  type: 0,
  options: {},
});

describe('toBooleanFromTransform', () => {
  it('should convert value via obj[key] when both are present', () => {
    const params = makeParams('isActive', 'true', { isActive: 'true' });

    expect(toBooleanFromTransform(params)).toBe(true);
  });

  it('should fallback to params.value when obj is missing', () => {
    const params = makeParams('isActive', 'false', undefined);

    expect(toBooleanFromTransform(params)).toBe(false);
  });

  it('should return undefined for empty string value', () => {
    const params = makeParams('isActive', '', { isActive: '' });

    expect(toBooleanFromTransform(params)).toBeUndefined();
  });
});
