import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { EnrollmentStatus as EnrollmentStatusEnum } from '../../../../shared/domain/enums/enrollment-status.enum.js';
import {
  StudentEnrollmentEntity as EnrollmentEntity,
  EnrollmentWithDetails,
} from '../entities/enrollment.entity.js';

export { EnrollmentStatus } from '../../../../shared/domain/enums/enrollment-status.enum.js';
export { StudentStatusEnum as StudentStatus } from '../../../../shared/domain/enums/student-status.enum.js';
export type { EnrollmentWithDetails };

export interface StudentEnrollmentQueryInput extends PaginationQueryInput {
  studentId?: string;
  classroomId?: string;
  semesterId?: string;
  academicYearId?: string;
  status?: EnrollmentStatusEnum;
}

export interface CreateEnrollmentRepositoryInput {
  studentId: string;
  classroomId: string;
  semesterId: string;
  status?: EnrollmentStatusEnum;
}

export interface UpdateEnrollmentRepositoryInput {
  classroomId?: string;
  semesterId?: string;
  status?: EnrollmentStatusEnum;
  /** Set when an enrollment is dropped or transferred out. */
  endedAt?: Date | null;
  note?: string | null;
}

export abstract class IEnrollmentRepository {
  abstract findAll(
    query: StudentEnrollmentQueryInput,
  ): Promise<PaginatedResult<EnrollmentWithDetails>>;
  abstract findById(id: string): Promise<EnrollmentWithDetails | null>;
  abstract findActiveEnrollment(
    studentId: string,
    semesterId?: string,
    excludeId?: string,
  ): Promise<EnrollmentWithDetails | null>;
  abstract create(
    input: CreateEnrollmentRepositoryInput,
  ): Promise<EnrollmentWithDetails>;
  abstract update(
    id: string,
    input: UpdateEnrollmentRepositoryInput,
  ): Promise<EnrollmentWithDetails>;
  abstract remove(id: string): Promise<EnrollmentEntity>;
  abstract softDelete(id: string): Promise<EnrollmentEntity>;
  abstract restore(
    id: string,
    input: { classroomId: string },
  ): Promise<EnrollmentWithDetails>;
  abstract findDuplicate(
    studentId: string,
    classroomId?: string,
    semesterId?: string,
    excludeId?: string,
  ): Promise<EnrollmentWithDetails | null>;
  abstract findSoftDeleted(
    studentId: string,
    semesterId?: string,
  ): Promise<EnrollmentWithDetails | null>;
  abstract countActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<number>;
  abstract countActiveByIds(ids: string[]): Promise<number>;
  abstract findManyActiveByIds(ids: string[]): Promise<EnrollmentWithDetails[]>;
  abstract createMany(
    data: CreateEnrollmentRepositoryInput[],
  ): Promise<{ count: number }>;
}
