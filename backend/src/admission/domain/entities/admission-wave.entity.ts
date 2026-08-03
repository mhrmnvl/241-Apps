import type { AcademicYearRef } from '../../../shared/domain/entities/index.js';
import type { DecimalValue } from '../../../shared/domain/types/decimal.type.js';

export interface AdmissionWaveEntity {
  id: string;
  academicYearId: string;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  quota: number;
  registrationFee: DecimalValue;
  description: string | null;
  isActive: boolean;
  lastRegistrationSeq: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveWaveRow extends AdmissionWaveEntity {
  /** Always resolved — every query returning this row includes the academic year. */
  academicYear: AcademicYearRef;
  _count?: {
    applications?: number;
  };
}

export interface AdmissionWaveAcceptedCount {
  waveId?: string;
  count?: number;
  id?: string;
  name?: string;
  code?: string;
  quota: number;
  accepted: number;
  fillRate?: number;
}
