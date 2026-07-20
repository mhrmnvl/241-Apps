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

// Admin detail view adds the applicant account + religion on top of the
// shared application detail include.
export const applicationAdminDetailInclude = {
  ...applicationDetailInclude,
  religion: true,
  user: { select: { id: true, identifier: true, lastLoginAt: true } },
} satisfies Prisma.AdmissionApplicationInclude;

export type ApplicationAdminDetail = Prisma.AdmissionApplicationGetPayload<{
  include: typeof applicationAdminDetailInclude;
}>;

export const applicationListInclude = {
  wave: { select: { id: true, name: true, code: true } },
  payment: { select: { status: true } },
  _count: { select: { documents: true } },
} satisfies Prisma.AdmissionApplicationInclude;

export type ApplicationListItem = Prisma.AdmissionApplicationGetPayload<{
  include: typeof applicationListInclude;
}>;
