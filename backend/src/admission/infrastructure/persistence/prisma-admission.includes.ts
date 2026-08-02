import { Prisma } from '@prisma/client';

export const WAVE_WITH_DETAILS_INCLUDE = {
  academicYear: true,
  _count: {
    select: {
      applications: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.AdmissionWaveInclude;

export type WaveWithDetails = Prisma.AdmissionWaveGetPayload<{
  include: typeof WAVE_WITH_DETAILS_INCLUDE;
}>;

export const APPLICATION_WITH_DETAILS_INCLUDE = {
  user: {
    include: {
      profile: true,
    },
  },
  wave: { include: { academicYear: true } },
  parents: {
    include: {
      occupation: true,
      education: true,
    },
  },
} satisfies Prisma.AdmissionApplicationInclude;

export type ApplicationWithDetails = Prisma.AdmissionApplicationGetPayload<{
  include: typeof APPLICATION_WITH_DETAILS_INCLUDE;
}>;
