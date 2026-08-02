import { Prisma } from '@prisma/client';

export const LOAN_WITH_DETAILS_INCLUDE = {
  items: {
    include: {
      unit: {
        include: {
          asset: true,
          location: true,
          status: true,
          condition: true,
        },
      },
    },
  },
} satisfies Prisma.InventoryLoanInclude;

export type LoanWithDetails = Prisma.InventoryLoanGetPayload<{
  include: typeof LOAN_WITH_DETAILS_INCLUDE;
}>;
