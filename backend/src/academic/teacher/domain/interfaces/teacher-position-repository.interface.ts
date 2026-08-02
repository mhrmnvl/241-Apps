import { TeacherPositionWithDetails } from '../entities/teacher.entity.js';

export interface PositionRow {
  id: string;
  name: string;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface CreateTeacherPositionRepositoryInput {
  positionId: string;
  hireDate: Date;
  isPrimary?: boolean;
}

export type UpdateTeacherPositionRepositoryInput =
  Partial<CreateTeacherPositionRepositoryInput>;

export abstract class ITeacherPositionRepository {
  abstract findByTeacherId(
    teacherId: string,
  ): Promise<TeacherPositionWithDetails[]>;
  abstract findById(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPositionWithDetails | null>;
  abstract findByTeacherAndPosition(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPositionWithDetails | null>;
  abstract findPositionById(positionId: string): Promise<PositionRow | null>;
  abstract create(
    teacherId: string,
    input: CreateTeacherPositionRepositoryInput,
  ): Promise<TeacherPositionWithDetails>;
  abstract update(
    teacherId: string,
    positionId: string,
    input: UpdateTeacherPositionRepositoryInput,
  ): Promise<TeacherPositionWithDetails>;
  abstract softDelete(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPositionWithDetails>;
}
