import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../shared/domain/interfaces/repository.interface.js';
import {
  AdmissionWaveEntity,
  ActiveWaveRow,
} from '../entities/admission.entity.js';

export type AdmissionWaveWithRelations = ActiveWaveRow;
export type AdmissionWaveWithAcademicYear = ActiveWaveRow;

export interface AdmissionWaveQueryInput extends PaginationQueryInput {
  search?: string;
  academicYearId?: string;
  isActive?: boolean;
}

export interface CreateAdmissionWaveRepositoryInput {
  name: string;
  code: string;
  academicYearId: string;
  startDate: Date;
  endDate: Date;
  quota: number;
  registrationFee: number;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateAdmissionWaveRepositoryInput {
  name?: string;
  code?: string;
  academicYearId?: string;
  startDate?: Date;
  endDate?: Date;
  quota?: number;
  registrationFee?: number;
  description?: string | null;
  isActive?: boolean;
}

export abstract class IAdmissionWaveRepository {
  abstract findAll(
    query: AdmissionWaveQueryInput,
  ): Promise<PaginatedResult<ActiveWaveRow>>;
  abstract findById(id: string): Promise<ActiveWaveRow | null>;
  abstract findByCode(code: string): Promise<AdmissionWaveEntity | null>;
  abstract findActiveWave(): Promise<AdmissionWaveEntity | null>;
  abstract create(
    input: CreateAdmissionWaveRepositoryInput,
  ): Promise<ActiveWaveRow>;
  abstract update(
    id: string,
    input: UpdateAdmissionWaveRepositoryInput,
  ): Promise<ActiveWaveRow>;
  abstract remove(id: string): Promise<AdmissionWaveEntity>;
  abstract softDelete(id: string): Promise<AdmissionWaveEntity>;
}
