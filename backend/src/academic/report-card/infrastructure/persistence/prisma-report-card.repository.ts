import { Injectable } from '@nestjs/common';
import { Prisma, ReportCard } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ReportCardQueryDto } from '../../dto/request/report-card-query.dto.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IReportCardRepository,
  RAPOR_INCLUDE,
  ReportCardWithDetails,
  UpsertReportCardRepositoryInput,
  UpdateReportCardRepositoryInput,
} from '../../domain/interfaces/report-card-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaReportCardRepository extends IReportCardRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ReportCardQueryDto,
  ): Promise<PaginatedResult<ReportCardWithDetails>> {
    const {
      page = 1,
      limit = 10,
      studentId,
      classroomId,
      semesterId,
      isPublished,
    } = query;
    const skip = (page - 1) * limit;

    const resolvedSemesterId = await resolveSemesterId(this.prisma, semesterId);

    const where: Prisma.ReportCardWhereInput = {
      deletedAt: null,
      ...(isPublished !== undefined && { isPublished }),
      ...(studentId && { enrollment: { studentId } }),
      ...(classroomId && { enrollment: { classroomId } }),
      ...(resolvedSemesterId && {
        enrollment: { semesterId: resolvedSemesterId },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.reportCard.findMany({
        where,
        include: RAPOR_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reportCard.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ReportCardWithDetails | null> {
    return this.prisma.reportCard.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: RAPOR_INCLUDE,
    });
  }

  async findByEnrollmentId(
    enrollmentId: string,
  ): Promise<ReportCardWithDetails | null> {
    return this.prisma.reportCard.findFirst({
      where: {
        enrollmentId,
        deletedAt: null,
      },
      include: RAPOR_INCLUDE,
    });
  }

  async upsert(
    data: UpsertReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails> {
    const { enrollmentId, ...fields } = data;

    return this.prisma.reportCard.upsert({
      where: { enrollmentId },
      create: { enrollmentId, ...fields },
      update: { ...fields },
      include: RAPOR_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails> {
    return this.prisma.reportCard.update({
      where: { id },
      data,
      include: RAPOR_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<ReportCard> {
    return this.prisma.reportCard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
