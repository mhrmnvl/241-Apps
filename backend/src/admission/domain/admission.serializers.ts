import {
  DecimalValue,
  toNumericValue,
} from '../../shared/domain/types/decimal.type.js';

// Decimal instances get mangled by the global ClassSerializerInterceptor
// (instanceToPlain copies its internal {s,e,d} props), so convert money fields
// to plain numbers before returning from use-cases.

export function serializeWave<T extends { registrationFee: DecimalValue }>(
  wave: T,
) {
  return {
    ...wave,
    registrationFee: toNumericValue(wave.registrationFee),
  };
}

export function serializePayment<T extends { amount: DecimalValue }>(
  payment: T,
) {
  return {
    ...payment,
    amount: toNumericValue(payment.amount),
  };
}

export function serializeApplicationDetail<
  T extends {
    wave?: { registrationFee: DecimalValue } | null;
    payment?: { amount: DecimalValue } | null;
  },
>(application: T) {
  return {
    ...application,
    ...(application.wave && { wave: serializeWave(application.wave) }),
    ...(application.payment && {
      payment: serializePayment(application.payment),
    }),
  };
}

export type SerializedDecimal = DecimalValue;
