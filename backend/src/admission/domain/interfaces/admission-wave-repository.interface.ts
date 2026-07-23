import { AdmissionWave, Prisma } from '@prisma/client';
import { AdmissionWaveQueryDto } from '../../dto/request/admission-wave-query.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';

export type AdmissionWaveWithRelations = Prisma.AdmissionWaveGetPayload<{
  include: {
    academicYear: true;
    _count: { select: { applications: true } };
  };
}>;

export type AdmissionWaveWithAcademicYear = Prisma.AdmissionWaveGetPayload<{
  include: { academicYear: true };
}>;

export interface CreateAdmissionWaveRepositoryInput {
  name: string;
  code: string;
  academicYearId: string;
  startDate: Date;
  endDate: Date;
  quota: number;
  registrationFee: number;
  description: string | null;
  isActive: boolean;
}

export abstract class IAdmissionWaveRepository {
  abstract findAll(
    query: AdmissionWaveQueryDto,
  ): Promise<PaginatedResult<AdmissionWaveWithRelations>>;
  abstract findById(id: string): Promise<AdmissionWaveWithRelations | null>;
  abstract findByCode(code: string): Promise<AdmissionWave | null>;
  abstract create(
    data: CreateAdmissionWaveRepositoryInput,
  ): Promise<AdmissionWaveWithAcademicYear>;
  abstract update(
    id: string,
    data: Prisma.AdmissionWaveUncheckedUpdateInput,
  ): Promise<AdmissionWaveWithAcademicYear>;
  abstract softDelete(id: string): Promise<AdmissionWave>;
}
