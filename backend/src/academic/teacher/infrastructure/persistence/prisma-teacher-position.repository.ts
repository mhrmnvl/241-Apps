import { Injectable } from '@nestjs/common';
import { Position, TeacherPosition } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  ITeacherPositionsRepository,
  TEACHER_POSITION_INCLUDE,
  TeacherPositionWithDetails,
} from '../../domain/interfaces/teacher-position-repository.interface.js';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../../dto/request/teacher-position.request.dto.js';

@Injectable()
export class PrismaTeacherPositionsRepository extends ITeacherPositionsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(teacherId: string): Promise<TeacherPositionWithDetails[]> {
    return this.prisma.teacherPosition.findMany({
      where: { teacherId, position: { isActive: true } },
      include: TEACHER_POSITION_INCLUDE,
      orderBy: [{ isPrimary: 'desc' }, { hireDate: 'desc' }],
    });
  }

  async findLinkById(
    teacherId: string,
    linkId: string,
  ): Promise<TeacherPosition | null> {
    return this.prisma.teacherPosition.findFirst({
      where: { id: linkId, teacherId },
    });
  }

  async findPosition(positionId: string): Promise<Position | null> {
    return this.prisma.position.findUnique({ where: { id: positionId } });
  }

  async findAssignment(
    teacherId: string,
    positionId: string,
    hireDate: Date,
  ): Promise<TeacherPosition | null> {
    return this.prisma.teacherPosition.findUnique({
      where: {
        teacherId_positionId_hireDate: { teacherId, positionId, hireDate },
      },
    });
  }

  async assign(
    teacherId: string,
    dto: CreateTeacherPositionDto,
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
          hireDate: new Date(dto.hireDate),
          isPrimary: dto.isPrimary ?? false,
        },
        include: TEACHER_POSITION_INCLUDE,
      });
    });
  }

  async update(
    teacherId: string,
    linkId: string,
    dto: UpdateTeacherPositionDto,
  ): Promise<TeacherPositionWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.teacherPosition.updateMany({
          where: { teacherId, isPrimary: true, NOT: { id: linkId } },
          data: { isPrimary: false },
        });
      }
      return tx.teacherPosition.update({
        where: { id: linkId },
        data: {
          ...(dto.hireDate && { hireDate: new Date(dto.hireDate) }),
          ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        },
        include: TEACHER_POSITION_INCLUDE,
      });
    });
  }

  async remove(linkId: string): Promise<TeacherPosition> {
    return this.prisma.teacherPosition.update({
      where: { id: linkId },
      data: { deletedAt: new Date() },
    });
  }
}
