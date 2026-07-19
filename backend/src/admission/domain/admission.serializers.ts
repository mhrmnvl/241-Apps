import { AdmissionPayment, AdmissionWave, Prisma } from '@prisma/client';

// Prisma Decimal instances get mangled by the global ClassSerializerInterceptor
// (instanceToPlain copies its internal {s,e,d} props), so convert money fields
// to plain numbers before returning from use-cases.

export function serializeWave<T extends AdmissionWave>(wave: T) {
  return {
    ...wave,
    registrationFee: Number(wave.registrationFee),
  };
}

export function serializePayment<T extends AdmissionPayment>(payment: T) {
  return {
    ...payment,
    amount: Number(payment.amount),
  };
}

export function serializeApplicationDetail<
  T extends {
    wave?: AdmissionWave & Record<string, unknown>;
    payment?: (AdmissionPayment & Record<string, unknown>) | null;
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

export type SerializedDecimal = number | Prisma.Decimal;
