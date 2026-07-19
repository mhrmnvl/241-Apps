import { AcademicCalendarType, Prisma } from '@prisma/client';
import { AcademicCalendarTypeQueryDto } from '../../dto/academic-calendar-type-query.dto.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IAcademicCalendarTypeRepository {
  abstract findAll(
    query: AcademicCalendarTypeQueryDto,
  ): Promise<PaginatedResult<AcademicCalendarType>>;

  abstract findById(id: string): Promise<AcademicCalendarType | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<AcademicCalendarType | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<AcademicCalendarType>;

  abstract update(
    id: string,
    data: Prisma.AcademicCalendarTypeUpdateInput,
  ): Promise<AcademicCalendarType>;

  abstract softDelete(id: string): Promise<AcademicCalendarType>;
}
