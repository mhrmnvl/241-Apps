import { Prisma, StudentParent } from '@prisma/client';
import { StudentParentQueryDto } from '../../dto/student-parent-query.dto.js';
import { CreateStudentParentDto } from '../../dto/create-student-parent.dto.js';
import { UpdateStudentParentDto } from '../../dto/update-student-parent.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const STUDENT_PARENT_INCLUDE = {
  student: {
    include: {
      user: { include: { profile: { select: { name: true } } } },
    },
  },
  parent: {
    include: { occupation: true },
  },
} satisfies Prisma.StudentParentInclude;

export type StudentParentWithDetails = Prisma.StudentParentGetPayload<{
  include: typeof STUDENT_PARENT_INCLUDE;
}>;

export interface StudentReference {
  id: string;
}

export interface ParentReference {
  id: string;
}

export abstract class IStudentParentRepository {
  abstract findAll(
    query: StudentParentQueryDto,
  ): Promise<PaginatedResult<StudentParentWithDetails>>;
  abstract findById(id: string): Promise<StudentParentWithDetails | null>;
  abstract findPair(
    studentId: string,
    parentId: string,
  ): Promise<StudentParent | null>;
  abstract findStudent(id: string): Promise<StudentReference | null>;
  abstract findParent(id: string): Promise<ParentReference | null>;
  abstract create(
    dto: CreateStudentParentDto,
  ): Promise<StudentParentWithDetails>;
  abstract update(
    id: string,
    studentId: string,
    dto: UpdateStudentParentDto,
  ): Promise<StudentParentWithDetails>;
  abstract remove(id: string): Promise<StudentParent>;
}
