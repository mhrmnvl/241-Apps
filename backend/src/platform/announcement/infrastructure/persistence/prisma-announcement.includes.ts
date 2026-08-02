import { Prisma } from '@prisma/client';

export const ANNOUNCEMENT_INCLUDE = {
  classrooms: { include: { classroom: true } },
} satisfies Prisma.AnnouncementInclude;

export type AnnouncementWithDetails = Prisma.AnnouncementGetPayload<{
  include: typeof ANNOUNCEMENT_INCLUDE;
}>;
