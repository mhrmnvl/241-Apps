import { Injectable } from '@nestjs/common';
import { Prisma, ReportCard } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  ReportCardQueryInput,
  CreateReportCardRepositoryInput,
  UpdateReportCardRepositoryInput,
} from '../../domain/interfaces/report-card-repository.interface.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import { IReportCardRepository } from '../../domain/interfaces/report-card-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  REPORT_CARD_WITH_DETAILS_INCLUDE,
  ReportCardWithDetails,
} from './prisma-report-card.includes.js';

@Injectable()
export class PrismaReportCardRepository extends IReportCardRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ReportCardQueryInput,
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
        include: REPORT_CARD_WITH_DETAILS_INCLUDE,
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
      include: REPORT_CARD_WITH_DETAILS_INCLUDE,
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
      include: REPORT_CARD_WITH_DETAILS_INCLUDE,
    });
  }

  async create(
    dto: CreateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails> {
    return this.prisma.reportCard.create({
      data: dto,
      include: REPORT_CARD_WITH_DETAILS_INCLUDE,
    });
  }

  async upsert(
    input: CreateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails> {
    const { enrollmentId, ...fields } = input;

    return this.prisma.reportCard.upsert({
      where: { enrollmentId },
      create: { enrollmentId, ...fields },
      update: fields,
      include: REPORT_CARD_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails> {
    return this.prisma.reportCard.update({
      where: { id },
      data,
      include: REPORT_CARD_WITH_DETAILS_INCLUDE,
    });
  }

  async calculateAndApplyClassroomRanks(
    classroomId: string,
    semesterId: string,
    targetEnrollmentId?: string,
  ): Promise<number | null> {
    const reportCardsInClass = await this.prisma.reportCard.findMany({
      where: {
        deletedAt: null,
        totalAverage: { not: null },
        enrollment: {
          classroomId,
          semesterId,
          deletedAt: null,
        },
      },
      select: { id: true, enrollmentId: true, totalAverage: true },
      orderBy: { totalAverage: 'desc' },
    });

    let targetRank: number | null = null;
    for (let i = 0; i < reportCardsInClass.length; i++) {
      const item = reportCardsInClass[i];
      const rankValue = i + 1;
      await this.prisma.reportCard.update({
        where: { id: item.id },
        data: { rank: rankValue },
      });
      if (item.enrollmentId === targetEnrollmentId) {
        targetRank = rankValue;
      }
    }
    return targetRank;
  }

  async remove(id: string): Promise<ReportCard> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<ReportCard> {
    return this.prisma.reportCard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
