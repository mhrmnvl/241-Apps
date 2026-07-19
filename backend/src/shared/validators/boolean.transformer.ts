import type { TransformFnParams } from 'class-transformer';

export function toBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return value;
}

export function toBooleanFromTransform(params: TransformFnParams): unknown {
  const source = params.obj as Record<string, unknown> | undefined;
  if (source && typeof params.key === 'string') {
    return toBoolean(source[params.key]);
  }
  return toBoolean(params.value);
}
