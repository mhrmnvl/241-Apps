import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service.js';
import { AdmissionApplicationQueryDto } from '../dto/admission-query.dto.js';

@Injectable()
export class GetApplicationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AdmissionApplicationQueryDto) {
    const { page = 1, limit = 10, search, status, waveId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionApplicationWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(waveId && { waveId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.admissionApplication.findMany({
        where,
        skip,
        take: limit,
        include: {
          wave: { select: { id: true, name: true, code: true } },
          payment: { select: { status: true } },
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionApplication.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
