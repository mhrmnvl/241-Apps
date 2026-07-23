import { Prisma, Teacher, User, Profile } from '@prisma/client';
import { TeacherQueryDto } from '../../dto/request/teacher-query.dto.js';
import { ExportTeacherQueryDto } from '../../dto/request/export-teacher-query.dto.js';
import { CreateTeacherDto } from '../../dto/request/create-teacher.dto.js';
import { UpdateTeacherDto } from '../../dto/request/update-teacher.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const USER_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
} as const;

export const TEACHER_LIST_INCLUDE = {
  user: { select: USER_SELECT },
  employmentType: true,
  teacherPositions: {
    where: { isPrimary: true },
    include: { position: { include: { category: true } } },
  },
} satisfies Prisma.TeacherInclude;

export const TEACHER_DETAIL_INCLUDE = {
  user: { select: USER_SELECT },
  employmentType: true,
  addresses: {
    omit: {
      studentId: true,
      teacherId: true,
      parentId: true,
    },
    orderBy: { isPrimary: 'desc' as const },
  },
  teacherPositions: {
    include: { position: { include: { category: true } } },
    orderBy: [{ isPrimary: 'desc' as const }, { hireDate: 'desc' as const }],
  },
} satisfies Prisma.TeacherInclude;

export type TeacherWithDetails = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_DETAIL_INCLUDE;
}>;

export type TeacherListWithDetails = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_LIST_INCLUDE;
}>;

export abstract class ITeacherRepository {
  abstract toggleUserActive(userId: string, isActive: boolean): Promise<User>;
  abstract findAll(
    query: TeacherQueryDto,
  ): Promise<PaginatedResult<TeacherListWithDetails>>;
  abstract findAllForExport(
    filters: ExportTeacherQueryDto,
  ): Promise<TeacherListWithDetails[]>;
  abstract findById(id: string): Promise<TeacherWithDetails | null>;
  abstract findUserByIdentifier(identifier: string): Promise<User | null>;
  abstract findProfileByNik(nik: string): Promise<Profile | null>;
  abstract findByUserId(userId: string): Promise<Teacher | null>;
  abstract findByNip(nip: string, excludeId?: string): Promise<Teacher | null>;
  abstract findByNuptk(
    nuptk: string,
    excludeId?: string,
  ): Promise<Teacher | null>;
  abstract findProfileByUserId(
    userId: string,
    nik: string,
  ): Promise<Profile | null>;
  abstract updateProfile(
    userId: string,
    data: Prisma.ProfileUpdateInput,
  ): Promise<Profile>;
  abstract create(
    dto: CreateTeacherDto,
    hashedPassword: string,
  ): Promise<TeacherWithDetails>;
  abstract update(
    id: string,
    dto: UpdateTeacherDto,
  ): Promise<TeacherWithDetails>;
  abstract resolveEmploymentTypeId(code: string): Promise<string>;
  abstract softDelete(id: string, userId: string): Promise<[Teacher, User]>;
  abstract getActiveEmploymentTypeCodes(): Promise<string[]>;
}
