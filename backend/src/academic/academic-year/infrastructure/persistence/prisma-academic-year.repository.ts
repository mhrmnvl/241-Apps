import { Injectable } from '@nestjs/common';
import { AcademicYear, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IAcademicYearRepository,
  CopiedClassroomFields,
  CreateAcademicYearRepositoryInput,
  CreateAcademicYearWithRelationsResult,
} from '../../domain/interfaces/academic-year-repository.interface.js';
import { AcademicYearQueryDto } from '../../dto/academic-year-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaAcademicYearRepository extends IAcademicYearRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AcademicYearQueryDto,
  ): Promise<PaginatedResult<AcademicYear>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AcademicYearWhereInput = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.academicYear.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.academicYear.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AcademicYear | null> {
    return this.prisma.academicYear.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<AcademicYear | null> {
    return this.prisma.academicYear.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findLatestAcademicYear(): Promise<AcademicYear | null> {
    return this.prisma.academicYear.findFirst({
      where: { deletedAt: null },
      orderBy: { name: 'desc' },
    });
  }

  async findClassesByAcademicYear(
    academicYearId: string,
  ): Promise<CopiedClassroomFields[]> {
    const classrooms = await this.prisma.classroom.findMany({
      where: { academicYearId, deletedAt: null },
      select: {
        gradeId: true,
        code: true,
        name: true,
        capacity: true,
        curriculumId: true,
        isActive: true,
      },
    });
    return classrooms;
  }

  async create(data: CreateAcademicYearRepositoryInput): Promise<AcademicYear> {
    return this.prisma.academicYear.create({
      data: {
        name: data.name,
        isActive: data.isActive,
      },
    });
  }

  async createWithSemestersAndClasses(
    ayData: CreateAcademicYearRepositoryInput,
    copyClasses: boolean,
  ): Promise<CreateAcademicYearWithRelationsResult> {
    return this.prisma.$transaction(async (tx) => {
      const academicYear = await tx.academicYear.create({
        data: {
          name: ayData.name,
          isActive: ayData.isActive,
        },
      });

      const semesterTypes = await tx.semesterType.findMany({
        where: { isActive: true, deletedAt: null },
      });
      const oddType = semesterTypes.find((t) => t.name === 'ODD');
      const evenType = semesterTypes.find((t) => t.name === 'EVEN');

      if (!oddType || !evenType) {
        throw new Error('Default Semester Types (ODD, EVEN) must exist');
      }

      const [semesterGanjil, semesterGenap] = await Promise.all([
        tx.semester.create({
          data: {
            academicYearId: academicYear.id,
            typeId: oddType.id,
            isActive: false,
          },
        }),
        tx.semester.create({
          data: {
            academicYearId: academicYear.id,
            typeId: evenType.id,
            isActive: false,
          },
        }),
      ]);

      let classroomsCreated = 0;

      if (copyClasses) {
        const previousAy = await tx.academicYear.findFirst({
          where: {
            deletedAt: null,
            id: { not: academicYear.id },
          },
          orderBy: { name: 'desc' },
        });

        if (previousAy) {
          const previousClasses = await tx.classroom.findMany({
            where: { academicYearId: previousAy.id, deletedAt: null },
            select: {
              gradeId: true,
              code: true,
              name: true,
              capacity: true,
              curriculumId: true,
              isActive: true,
            },
          });

          if (previousClasses.length > 0) {
            await tx.classroom.createMany({
              data: previousClasses.map((classroom) => ({
                academicYearId: academicYear.id,
                gradeId: classroom.gradeId,
                code: classroom.code,
                name: classroom.name,
                capacity: classroom.capacity,
                curriculumId: classroom.curriculumId,
                isActive: classroom.isActive,
              })),
            });
            classroomsCreated = previousClasses.length;
          }
        }
      }

      return {
        academicYear,
        semesters: [semesterGanjil, semesterGenap],
        classroomsCreated,
      };
    });
  }

  async update(
    id: string,
    data: Prisma.AcademicYearUpdateInput,
  ): Promise<AcademicYear> {
    return this.prisma.academicYear.update({ where: { id }, data });
  }

  async deactivateAll(): Promise<Prisma.BatchPayload> {
    return this.prisma.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  async activateById(id: string): Promise<AcademicYear> {
    return this.prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      return tx.academicYear.update({
        where: { id },
        data: { isActive: true },
      });
    });
  }

  async hasRelatedData(id: string): Promise<boolean> {
    const count = await this.prisma.semester.count({
      where: {
        academicYearId: id,
        deletedAt: null,
        enrollments: { some: { deletedAt: null } },
      },
      take: 1,
    });
    return count > 0;
  }

  async countActive(): Promise<number> {
    return this.prisma.academicYear.count({
      where: { isActive: true, deletedAt: null },
    });
  }

  async deactivateSemestersByAcademicYearId(
    academicYearId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.semester.updateMany({
      where: { academicYearId, isActive: true, deletedAt: null },
      data: { isActive: false },
    });
  }

  async softDelete(id: string): Promise<AcademicYear> {
    return this.prisma.academicYear.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
