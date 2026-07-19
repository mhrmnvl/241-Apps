import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service.js';
import { serializeWave } from '../domain/admission.serializers.js';
import {
  AdmissionWaveQueryDto,
  CreateAdmissionWaveDto,
  UpdateAdmissionWaveDto,
} from '../dto/admission-wave.dto.js';

@Injectable()
export class GetAdmissionWavesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AdmissionWaveQueryDto) {
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
        include: {
          academicYear: true,
          _count: {
            select: { applications: { where: { deletedAt: null } } },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.admissionWave.count({ where }),
    ]);

    return {
      data: data.map(serializeWave),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class GetAdmissionWaveByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const wave = await this.prisma.admissionWave.findFirst({
      where: { id, deletedAt: null },
      include: {
        academicYear: true,
        _count: { select: { applications: { where: { deletedAt: null } } } },
      },
    });
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    return serializeWave(wave);
  }
}

@Injectable()
export class CreateAdmissionWaveUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAdmissionWaveDto) {
    const existing = await this.prisma.admissionWave.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Kode gelombang '${dto.code}' sudah dipakai`);
    }

    const created = await this.prisma.admissionWave.create({
      data: {
        name: dto.name,
        code: dto.code,
        academicYearId: dto.academicYearId,
        schoolUnitId: dto.schoolUnitId ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        quota: dto.quota,
        registrationFee: dto.registrationFee,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
      },
      include: { academicYear: true },
    });
    return serializeWave(created);
  }
}

@Injectable()
export class UpdateAdmissionWaveUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateAdmissionWaveDto) {
    const wave = await this.prisma.admissionWave.findFirst({
      where: { id, deletedAt: null },
    });
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }

    if (dto.code && dto.code !== wave.code) {
      const existing = await this.prisma.admissionWave.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Kode gelombang '${dto.code}' sudah dipakai`,
        );
      }
    }

    const { startDate, endDate, ...rest } = dto;
    const updated = await this.prisma.admissionWave.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
      include: { academicYear: true },
    });
    return serializeWave(updated);
  }
}

@Injectable()
export class DeleteAdmissionWaveUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const wave = await this.prisma.admissionWave.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { applications: { where: { deletedAt: null } } } },
      },
    });
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    if (wave._count.applications > 0) {
      throw new ConflictException(
        'Gelombang dengan pendaftar tidak dapat dihapus. Nonaktifkan saja.',
      );
    }

    return this.prisma.admissionWave.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
