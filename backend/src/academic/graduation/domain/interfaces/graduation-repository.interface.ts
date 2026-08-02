import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  StudentGraduationEntity,
  GraduationWithDetails,
  GraduationWithDetails as StudentGraduationWithDetails,
} from '../entities/graduation.entity.js';

export type { GraduationWithDetails, StudentGraduationWithDetails };

export interface StudentGraduationQueryInput extends PaginationQueryInput {
  academicYearId?: string;
  search?: string;
}

export interface CreateStudentGraduationRepositoryInput {
  studentId: string;
  academicYearId: string;
  graduationDate?: Date;
  certificateNo?: string;
  note?: string;
}

export type UpdateStudentGraduationRepositoryInput =
  Partial<CreateStudentGraduationRepositoryInput>;

export abstract class IGraduationRepository {
  abstract findAll(
    query: StudentGraduationQueryInput,
  ): Promise<PaginatedResult<GraduationWithDetails>>;
  abstract findById(id: string): Promise<GraduationWithDetails | null>;
  abstract findByStudentId(
    studentId: string,
  ): Promise<StudentGraduationEntity | null>;
  abstract create(
    input: CreateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails>;
  abstract update(
    id: string,
    input: UpdateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails>;
  abstract remove(id: string): Promise<StudentGraduationEntity>;
  abstract softDelete(id: string): Promise<StudentGraduationEntity>;
}
