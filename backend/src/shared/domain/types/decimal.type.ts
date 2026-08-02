/**
 * A fixed-point numeric value as it crosses the persistence boundary.
 *
 * The ORM hands back a Decimal instance for `Decimal` columns rather than a
 * plain `number`, so domain rows have to accept both. This structural type
 * describes the surface the codebase actually uses without importing the ORM
 * into the domain layer — every read site funnels through `Number(...)` before
 * the value reaches an API response.
 */
export interface DecimalLike {
  toNumber(): number;
  toFixed(decimalPlaces?: number): string;
  toString(): string;
}

export type DecimalValue = number | string | DecimalLike;

/** Narrow a {@link DecimalValue} to a plain number for transport/serialisation. */
export function toNumericValue(value: DecimalValue): number {
  return typeof value === 'number' ? value : Number(value);
}
