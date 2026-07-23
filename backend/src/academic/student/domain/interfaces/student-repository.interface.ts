import { Prisma, Student, User, Profile, StudentStatus } from '@prisma/client';
import { StudentQueryDto } from '../../dto/request/student-query.dto.js';
import { ExportStudentQueryDto } from '../../dto/request/export-student-query.dto.js';
import { CreateStudentDto } from '../../dto/request/create-student.dto.js';
import { UpdateStudentDto } from '../../dto/request/update-student.dto.js';
import { UpdateProfileDto } from '../../../../platform/profile/index.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const STUDENT_INCLUDE = {
  user: {
    select: {
      id: true,
      identifier: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
    },
  },
  grade: true,
  enrollments: {
    where: { deletedAt: null },
    include: {
      classroom: true,
      semester: { include: { academicYear: true } },
    },
    orderBy: { enrolledAt: 'desc' as const },
  },
} satisfies Prisma.StudentInclude;

export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof STUDENT_INCLUDE;
}>;

export interface CreateStudentResult extends User {
  student: StudentWithDetails | null;
}

export abstract class IStudentRepository {
  abstract toggleUserActive(userId: string, isActive: boolean): Promise<User>;
  abstract findAll(
    query: StudentQueryDto,
  ): Promise<PaginatedResult<StudentWithDetails>>;
  abstract findAllForExport(
    filters: ExportStudentQueryDto,
  ): Promise<StudentWithDetails[]>;
  abstract findById(id: string): Promise<StudentWithDetails | null>;
  abstract findByUserId(userId: string): Promise<{ id: string } | null>;
  abstract findByNis(nis: string): Promise<Student | null>;
  abstract findByNisn(nisn: string): Promise<Student | null>;
  abstract isStudent(userId: string): Promise<boolean>;
  abstract create(
    dto: CreateStudentDto,
    passwordHash: string,
  ): Promise<CreateStudentResult>;
  abstract update(
    id: string,
    dto: UpdateStudentDto,
  ): Promise<StudentWithDetails>;
  abstract updateStatus(
    id: string,
    status: StudentStatus,
  ): Promise<StudentWithDetails>;
  abstract remove(id: string): Promise<void>;
  abstract updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<Profile | null>;
  abstract softDelete(id: string, userId: string): Promise<[Student, User]>;
  abstract getActiveGradeLevels(): Promise<number[]>;
  abstract getActiveClassroomCodes(): Promise<string[]>;
}
