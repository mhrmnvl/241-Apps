import { Prisma, StudentGraduation } from '@prisma/client';
import { CreateStudentGraduationDto } from '../../dto/create-student-graduation.dto.js';
import { StudentGraduationQueryDto } from '../../dto/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../../dto/update-student-graduation.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const GRADUATION_INCLUDE = {
  student: {
    include: {
      user: { select: { profile: true, identifier: true } },
    },
  },
  academicYear: true,
} satisfies Prisma.StudentGraduationInclude;

export type StudentGraduationWithDetails = Prisma.StudentGraduationGetPayload<{
  include: typeof GRADUATION_INCLUDE;
}>;

export abstract class IGraduationRepository {
  abstract findAll(
    query: StudentGraduationQueryDto,
  ): Promise<PaginatedResult<StudentGraduationWithDetails>>;
  abstract findById(id: string): Promise<StudentGraduationWithDetails | null>;
  abstract findByStudentId(
    studentId: string,
  ): Promise<StudentGraduation | null>;
  abstract create(
    dto: CreateStudentGraduationDto,
  ): Promise<StudentGraduationWithDetails>;
  abstract update(
    id: string,
    dto: UpdateStudentGraduationDto,
  ): Promise<StudentGraduationWithDetails>;
  abstract softDelete(id: string): Promise<StudentGraduation>;
}
