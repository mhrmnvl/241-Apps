import { Prisma, StudentEnrollment, EnrollmentStatus } from '@prisma/client';
import type { StudentEnrollmentQueryDto } from '../../dto/request/student-enrollment-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ENROLLMENT_INCLUDE = {
  student: { include: { user: { select: { profile: true } } } },
  classroom: true,
  semester: { include: { academicYear: true, type: true } },
  reportCard: true,
} satisfies Prisma.StudentEnrollmentInclude;

export type EnrollmentWithDetails = Prisma.StudentEnrollmentGetPayload<{
  include: typeof ENROLLMENT_INCLUDE;
}>;

export abstract class IEnrollmentRepository {
  abstract findAll(
    query: StudentEnrollmentQueryDto,
  ): Promise<PaginatedResult<EnrollmentWithDetails>>;
  abstract findById(id: string): Promise<EnrollmentWithDetails | null>;
  abstract findActiveByStudentId(
    studentId: string,
  ): Promise<EnrollmentWithDetails | null>;
  abstract findActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<EnrollmentWithDetails[]>;
  abstract findDuplicate(
    studentId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<StudentEnrollment | null>;
  abstract create(data: {
    studentId: string;
    classroomId: string;
    semesterId: string;
    status?: EnrollmentStatus;
  }): Promise<EnrollmentWithDetails>;
  abstract update(
    id: string,
    data: Partial<{
      classroomId: string;
      semesterId: string;
      status: EnrollmentStatus;
      endedAt: Date;
      note: string;
    }>,
  ): Promise<EnrollmentWithDetails>;
  abstract createMany(
    data: {
      studentId: string;
      classroomId: string;
      semesterId: string;
      status?: EnrollmentStatus;
    }[],
  ): Promise<EnrollmentWithDetails[]>;
  abstract bulkCreateForRollover(
    data: {
      studentId: string;
      classroomId: string;
      semesterId: string;
    }[],
  ): Promise<Prisma.BatchPayload>;
  abstract bulkUpdateStatus(
    ids: string[],
    status: EnrollmentStatus,
    endedAt?: Date,
  ): Promise<Prisma.BatchPayload>;
  abstract findSoftDeleted(
    studentId: string,
    semesterId: string,
  ): Promise<StudentEnrollment | null>;
  abstract restore(
    id: string,
    data: { classroomId: string },
  ): Promise<EnrollmentWithDetails>;
  abstract softDelete(id: string): Promise<StudentEnrollment>;
}
