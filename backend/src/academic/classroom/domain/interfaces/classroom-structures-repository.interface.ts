import {
  Classroom,
  ClassroomStructure,
  Prisma,
  Semester,
  StudentEnrollment,
} from '@prisma/client';
import { ClassroomStructureQueryDto } from '../../dto/request/classroom-structure-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const STUDENT_SELECT = {
  id: true,
  nis: true,
  user: { select: { id: true, profile: { select: { name: true } } } },
} satisfies Prisma.StudentSelect;

export const CLASSROOM_STRUCTURE_INCLUDE = {
  classroom: true,
  semester: {
    select: {
      id: true,
      type: true,
      academicYear: { select: { id: true, name: true } },
    },
  },
  president: { select: STUDENT_SELECT },
  vicePresident: { select: STUDENT_SELECT },
  secretary: { select: STUDENT_SELECT },
  treasurer: { select: STUDENT_SELECT },
} satisfies Prisma.ClassroomStructureInclude;

export type ClassroomStructureWithDetails =
  Prisma.ClassroomStructureGetPayload<{
    include: typeof CLASSROOM_STRUCTURE_INCLUDE;
  }>;

export interface StudentSemesterStructureResult extends ClassroomStructure {
  classroom: { code: string };
}

export interface CreateClassroomStructureRepositoryInput {
  classroomId: string;
  semesterId: string;
  presidentId?: string;
  vicePresidentId?: string;
  secretaryId?: string;
  treasurerId?: string;
}

export interface UpdateClassroomStructureRepositoryInput {
  presidentId?: string | null;
  vicePresidentId?: string | null;
  secretaryId?: string | null;
  treasurerId?: string | null;
}

export abstract class IClassroomStructuresRepository {
  abstract findAll(
    query: ClassroomStructureQueryDto,
  ): Promise<PaginatedResult<ClassroomStructureWithDetails>>;
  abstract findById(id: string): Promise<ClassroomStructureWithDetails | null>;
  abstract findByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomStructureWithDetails | null>;
  abstract findClassroomById(id: string): Promise<Classroom | null>;
  abstract findSemesterById(id: string): Promise<Semester | null>;
  abstract findActiveEnrollment(
    studentId: string,
    classroomId: string,
    semesterId: string,
  ): Promise<StudentEnrollment | null>;
  abstract findByStudentAndSemester(
    studentId: string,
    semesterId: string,
  ): Promise<StudentSemesterStructureResult | null>;
  abstract create(
    data: CreateClassroomStructureRepositoryInput,
  ): Promise<ClassroomStructureWithDetails>;
  abstract update(
    id: string,
    data: UpdateClassroomStructureRepositoryInput,
  ): Promise<ClassroomStructureWithDetails>;
  abstract softDelete(id: string): Promise<ClassroomStructure>;
}
