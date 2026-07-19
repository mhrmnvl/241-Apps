import { Position, Prisma, TeacherPosition } from '@prisma/client';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../../dto/request/teacher-position.request.dto.js';

export const TEACHER_POSITION_INCLUDE = {
  position: { include: { category: true } },
} satisfies Prisma.TeacherPositionInclude;

export type TeacherPositionWithDetails = Prisma.TeacherPositionGetPayload<{
  include: typeof TEACHER_POSITION_INCLUDE;
}>;

export abstract class ITeacherPositionsRepository {
  abstract findAll(teacherId: string): Promise<TeacherPositionWithDetails[]>;
  abstract findLinkById(
    teacherId: string,
    linkId: string,
  ): Promise<TeacherPosition | null>;
  abstract findPosition(positionId: string): Promise<Position | null>;
  abstract findAssignment(
    teacherId: string,
    positionId: string,
    hireDate: Date,
  ): Promise<TeacherPosition | null>;
  abstract assign(
    teacherId: string,
    dto: CreateTeacherPositionDto,
  ): Promise<TeacherPositionWithDetails>;
  abstract update(
    teacherId: string,
    linkId: string,
    dto: UpdateTeacherPositionDto,
  ): Promise<TeacherPositionWithDetails>;
  abstract remove(linkId: string): Promise<TeacherPosition>;
}
