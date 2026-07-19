import { Prisma } from '@prisma/client';

export const applicationDetailInclude = {
  wave: {
    include: { academicYear: true },
  },
  parents: {
    include: { occupation: true, education: true },
    orderBy: { relation: 'asc' },
  },
  documents: {
    include: { documentType: true, file: true },
  },
  payment: {
    include: { proofFile: true },
  },
} satisfies Prisma.AdmissionApplicationInclude;

export type ApplicationDetail = Prisma.AdmissionApplicationGetPayload<{
  include: typeof applicationDetailInclude;
}>;
