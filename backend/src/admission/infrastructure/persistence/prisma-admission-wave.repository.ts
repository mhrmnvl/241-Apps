import { Injectable } from '@nestjs/common';
import { AdmissionWave, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AdmissionWaveQueryDto } from '../../dto/request/admission-wave-query.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';
import {
  AdmissionWaveWithAcademicYear,
  AdmissionWaveWithRelations,
  CreateAdmissionWaveRepositoryInput,
  IAdmissionWaveRepository,
} from '../../domain/interfaces/admission-wave-repository.interface.js';

const WAVE_INCLUDE = {
  academicYear: true,
  _count: { select: { applications: { where: { deletedAt: null } } } },
} satisfies Prisma.AdmissionWaveInclude;

@Injectable()
export class PrismaAdmissionWaveRepository extends IAdmissionWaveRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AdmissionWaveQueryDto,
  ): Promise<PaginatedResult<AdmissionWaveWithRelations>> {
    const { page = 1, limit = 10, search, academicYearId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionWaveWhereInput = {
      deletedAt: null,
      ...(academicYearId && { academicYearId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.admissionWave.findMany({
        where,
        skip,
        take: limit,
        include: WAVE_INCLUDE,
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.admissionWave.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AdmissionWaveWithRelations | null> {
    return this.prisma.admissionWave.findFirst({
      where: { id, deletedAt: null },
      include: WAVE_INCLUDE,
    });
  }

  async findByCode(code: string): Promise<AdmissionWave | null> {
    return this.prisma.admissionWave.findUnique({ where: { code } });
  }

  async create(
    data: CreateAdmissionWaveRepositoryInput,
  ): Promise<AdmissionWaveWithAcademicYear> {
    return this.prisma.admissionWave.create({
      data,
      include: { academicYear: true },
    });
  }

  async update(
    id: string,
    data: Prisma.AdmissionWaveUncheckedUpdateInput,
  ): Promise<AdmissionWaveWithAcademicYear> {
    return this.prisma.admissionWave.update({
      where: { id },
      data,
      include: { academicYear: true },
    });
  }

  async softDelete(id: string): Promise<AdmissionWave> {
    return this.prisma.admissionWave.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
