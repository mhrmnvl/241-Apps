import { Injectable } from '@nestjs/common';
import { Position, TeacherPosition } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ITeacherPositionRepository } from '../../domain/interfaces/teacher-position-repository.interface.js';
import type {
  CreateTeacherPositionRepositoryInput,
  UpdateTeacherPositionRepositoryInput,
} from '../../domain/interfaces/teacher-position-repository.interface.js';
import {
  TEACHER_POSITION_INCLUDE,
  TeacherPositionWithDetails,
} from './prisma-teacher.includes.js';

@Injectable()
export class PrismaTeacherPositionRepository extends ITeacherPositionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeacherId(
    teacherId: string,
  ): Promise<TeacherPositionWithDetails[]> {
    return this.prisma.teacherPosition.findMany({
      where: { teacherId, position: { isActive: true } },
      include: TEACHER_POSITION_INCLUDE,
      orderBy: [{ isPrimary: 'desc' }, { hireDate: 'desc' }],
    });
  }

  async findById(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPositionWithDetails | null> {
    return this.prisma.teacherPosition.findFirst({
      where: { id: positionId, teacherId },
      include: TEACHER_POSITION_INCLUDE,
    });
  }

  async findByTeacherAndPosition(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPositionWithDetails | null> {
    return this.prisma.teacherPosition.findFirst({
      where: { teacherId, positionId },
      include: TEACHER_POSITION_INCLUDE,
    });
  }

  async findPositionById(positionId: string): Promise<Position | null> {
    return this.prisma.position.findUnique({ where: { id: positionId } });
  }

  async create(
    teacherId: string,
    dto: CreateTeacherPositionRepositoryInput,
  ): Promise<TeacherPositionWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.teacherPosition.updateMany({
          where: { teacherId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.teacherPosition.create({
        data: {
          teacherId,
          positionId: dto.positionId,
          hireDate: dto.hireDate,
          isPrimary: dto.isPrimary ?? false,
        },
        include: TEACHER_POSITION_INCLUDE,
      });
    });
  }

  async update(
    teacherId: string,
    positionId: string,
    dto: UpdateTeacherPositionRepositoryInput,
  ): Promise<TeacherPositionWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.teacherPosition.updateMany({
          where: { teacherId, isPrimary: true, NOT: { id: positionId } },
          data: { isPrimary: false },
        });
      }
      return tx.teacherPosition.update({
        where: { id: positionId },
        data: {
          ...(dto.hireDate && { hireDate: dto.hireDate }),
          ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        },
        include: TEACHER_POSITION_INCLUDE,
      });
    });
  }

  async softDelete(
    teacherId: string,
    positionId: string,
  ): Promise<TeacherPosition> {
    return this.prisma.teacherPosition.update({
      where: { id: positionId },
      data: { deletedAt: new Date() },
    });
  }
}
