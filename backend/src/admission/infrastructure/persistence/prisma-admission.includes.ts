import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../shared/domain/prisma-selects.js';

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
      profile: PROFILE_NAME_SELECT,
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
