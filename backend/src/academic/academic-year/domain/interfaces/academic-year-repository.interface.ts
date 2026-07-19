import { AcademicYear, Prisma, Semester } from '@prisma/client';
import { AcademicYearQueryDto } from '../../dto/academic-year-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export interface CopiedClassroomFields {
  gradeId: string;
  code: string;
  name: string | null;
  capacity: number;
  curriculumId: string;
  isActive: boolean;
}

export interface CreateAcademicYearRepositoryInput {
  name: string;
  isActive: boolean;
}

export interface CreateAcademicYearWithRelationsResult {
  academicYear: AcademicYear;
  semesters: Semester[];
  classroomsCreated: number;
}

export abstract class IAcademicYearRepository {
  abstract findAll(
    query: AcademicYearQueryDto,
  ): Promise<PaginatedResult<AcademicYear>>;
  abstract findById(id: string): Promise<AcademicYear | null>;
  abstract findByName(name: string): Promise<AcademicYear | null>;
  abstract findLatestAcademicYear(): Promise<AcademicYear | null>;
  abstract findClassesByAcademicYear(
    academicYearId: string,
  ): Promise<CopiedClassroomFields[]>;
  abstract create(
    data: CreateAcademicYearRepositoryInput,
  ): Promise<AcademicYear>;
  abstract createWithSemestersAndClasses(
    ayData: CreateAcademicYearRepositoryInput,
    copyClasses: boolean,
  ): Promise<CreateAcademicYearWithRelationsResult>;
  abstract update(
    id: string,
    data: Prisma.AcademicYearUpdateInput,
  ): Promise<AcademicYear>;
  abstract deactivateAll(): Promise<Prisma.BatchPayload>;
  abstract activateById(id: string): Promise<AcademicYear>;
  abstract hasRelatedData(id: string): Promise<boolean>;
  abstract countActive(): Promise<number>;
  abstract deactivateSemestersByAcademicYearId(
    academicYearId: string,
  ): Promise<Prisma.BatchPayload>;
  abstract softDelete(id: string): Promise<AcademicYear>;
}
