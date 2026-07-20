import { AcademicCalendar, Prisma } from '@prisma/client';
import type { AcademicCalendarQueryDto } from '../../dto/request/academic-calendar-query.dto.js';
import type { CreateAcademicCalendarDto } from '../../dto/request/create-academic-calendar.dto.js';
import type { UpdateAcademicCalendarDto } from '../../dto/request/update-academic-calendar.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ACADEMIC_CALENDAR_INCLUDE = {
  academicYear: { select: { id: true, name: true } },
  semester: { select: { id: true, type: true, isActive: true } },
  type: true,
} satisfies Prisma.AcademicCalendarInclude;

export type AcademicCalendarWithDetails = Prisma.AcademicCalendarGetPayload<{
  include: typeof ACADEMIC_CALENDAR_INCLUDE;
}>;

export abstract class IAcademicCalendarRepository {
  abstract findAll(
    query: AcademicCalendarQueryDto,
  ): Promise<PaginatedResult<AcademicCalendarWithDetails>>;

  abstract findById(id: string): Promise<AcademicCalendarWithDetails | null>;

  abstract create(
    dto: CreateAcademicCalendarDto,
  ): Promise<AcademicCalendarWithDetails>;

  abstract update(
    id: string,
    dto: UpdateAcademicCalendarDto,
  ): Promise<AcademicCalendarWithDetails>;

  abstract softDelete(id: string): Promise<AcademicCalendar>;
}
