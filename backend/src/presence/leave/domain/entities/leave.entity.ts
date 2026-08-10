import { LeaveRequestStatus, LeaveTreatment } from '@prisma/client';
import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';

export type LeaveTreatmentEnum = `${LeaveTreatment}`;
export type LeaveRequestStatusEnum = `${LeaveRequestStatus}`;

export interface LeaveTypeEntity {
  id: string;
  code: string;
  name: string;
  treatment: LeaveTreatmentEnum;
  consumesQuota: boolean;
  annualQuota?: number | null;
  requiresDocument: boolean;
  appliesTo: PresenceSubjectTypeEnum;
  isActive: boolean;
  deletedAt?: Date | null;
}

export interface LeaveRequestEntity {
  id: string;
  requesterId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  documentFileId?: string | null;
  status: LeaveRequestStatusEnum;
  approverId?: string | null;
  decidedAt?: Date | null;
  decisionReason?: string | null;
  /** Materialised at submission — only working days count. */
  workingDayCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
}

export interface LeavePersonRef {
  id: string;
  displayName: string | null;
}

export interface LeaveTypeRef {
  id: string;
  code: string;
  name: string;
  treatment: LeaveTreatmentEnum;
}

export interface LeaveRequestWithDetails extends LeaveRequestEntity {
  requester: LeavePersonRef;
  approver?: LeavePersonRef | null;
  leaveType: LeaveTypeRef;
  days: Date[];
}

export interface LeaveBalanceRow {
  leaveTypeId: string;
  code: string;
  name: string;
  year: number;
  quota: number;
  /** Counted from approved days — never stored, so it cannot go stale. */
  used: number;
  remaining: number;
}
