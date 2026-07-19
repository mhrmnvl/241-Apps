import { Prisma, TeachingAssignment } from '@prisma/client';
import { TeachingAssignmentQueryDto } from '../../dto/teaching-assignment-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const TEACHING_ASSIGNMENT_INCLUDE = {
  teacher: { include: { user: { select: { profile: true } } } },
  classroom: true,
  subject: true,
  semester: { include: { academicYear: true } },
} satisfies Prisma.TeachingAssignmentInclude;

export type TeachingAssignmentWithDetails =
  Prisma.TeachingAssignmentGetPayload<{
    include: typeof TEACHING_ASSIGNMENT_INCLUDE;
  }>;

export interface ClassroomReference {
  id: string;
  academicYearId: string;
}

export interface SemesterReference {
  id: string;
  academicYearId: string;
}

export interface CreateTeachingAssignmentRepositoryInput {
  teacherId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

export interface UpdateTeachingAssignmentRepositoryInput {
  teacherId?: string;
  classroomId?: string;
  subjectId?: string;
  semesterId?: string;
}

export interface RestoreTeachingAssignmentRepositoryInput {
  teacherId?: string;
  classroomId?: string;
  subjectId?: string;
  semesterId?: string;
}

export abstract class ITeachingAssignmentRepository {
  abstract findAll(
    query: TeachingAssignmentQueryDto,
  ): Promise<PaginatedResult<TeachingAssignmentWithDetails>>;
  abstract findById(id: string): Promise<TeachingAssignmentWithDetails | null>;
  abstract findDuplicate(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<TeachingAssignment | null>;
  abstract create(
    data: CreateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract update(
    id: string,
    data: UpdateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract findSoftDeleted(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<TeachingAssignment | null>;
  abstract restore(
    id: string,
    data: RestoreTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract softDelete(id: string): Promise<TeachingAssignment>;
  abstract findClassroomById(id: string): Promise<ClassroomReference | null>;
  abstract findSemesterById(id: string): Promise<SemesterReference | null>;
}
