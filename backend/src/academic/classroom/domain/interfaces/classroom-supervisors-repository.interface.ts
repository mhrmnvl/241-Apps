import { ClassroomSupervisor, Prisma, Teacher } from '@prisma/client';
import { ClassroomSupervisorQueryDto } from '../../dto/classroom-supervisor-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const CLASS_SUPERVISOR_INCLUDE = {
  classroom: true,
  teacher: {
    include: {
      user: { select: { id: true, profile: { select: { name: true } } } },
    },
  },
  semester: {
    select: {
      id: true,
      type: true,
      academicYear: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ClassroomSupervisorInclude;

export type ClassroomSupervisorWithDetails =
  Prisma.ClassroomSupervisorGetPayload<{
    include: typeof CLASS_SUPERVISOR_INCLUDE;
  }>;

export interface ClassroomWithAcademicYear {
  id: string;
  academicYearId: string;
}

export interface SemesterWithAcademicYear {
  id: string;
  academicYearId: string;
}

export interface CreateClassroomSupervisorRepositoryInput {
  classroomId: string;
  teacherId: string;
  semesterId: string;
}

export interface UpdateClassroomSupervisorRepositoryInput {
  classroomId?: string;
  teacherId?: string;
  semesterId?: string;
}

export interface RestoreClassroomSupervisorRepositoryInput {
  teacherId: string;
}

export abstract class IClassroomSupervisorsRepository {
  abstract findAll(
    query: ClassroomSupervisorQueryDto,
  ): Promise<PaginatedResult<ClassroomSupervisorWithDetails>>;
  abstract findById(id: string): Promise<ClassroomSupervisorWithDetails | null>;
  abstract findByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomSupervisor | null>;
  abstract findClassroomById(
    id: string,
  ): Promise<ClassroomWithAcademicYear | null>;
  abstract findTeacherById(id: string): Promise<Teacher | null>;
  abstract findSemesterById(
    id: string,
  ): Promise<SemesterWithAcademicYear | null>;
  abstract create(
    data: CreateClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails>;
  abstract update(
    id: string,
    data: UpdateClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails>;
  abstract findSoftDeletedByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomSupervisor | null>;
  abstract restore(
    id: string,
    data: RestoreClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails>;
  abstract softDelete(id: string): Promise<ClassroomSupervisor>;
}
