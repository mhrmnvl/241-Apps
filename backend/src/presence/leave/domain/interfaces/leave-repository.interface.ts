import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';
import {
  LeaveBalanceRow,
  LeaveRequestStatusEnum,
  LeaveRequestWithDetails,
  LeaveTypeEntity,
} from '../entities/leave.entity.js';

export type { LeaveBalanceRow, LeaveRequestWithDetails, LeaveTypeEntity };

export interface CreateLeaveTypeInput {
  code: string;
  name: string;
  treatment: 'ON_LEAVE' | 'OFFICIAL_DUTY';
  consumesQuota: boolean;
  annualQuota?: number | null;
  requiresDocument: boolean;
  appliesTo: PresenceSubjectTypeEnum;
}

export type UpdateLeaveTypeInput = Partial<CreateLeaveTypeInput> & {
  isActive?: boolean;
};

export interface SubmitLeaveInput {
  requesterId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  documentFileId?: string | null;
  workingDayCount: number;
  /** The working days this request covers, resolved at submission. */
  days: Date[];
}

export interface LeaveRequestQueryInput {
  requesterId?: string;
  status?: LeaveRequestStatusEnum;
  year?: number;
}

export interface DecideLeaveInput {
  approverId: string;
  decidedAt: Date;
  decisionReason?: string | null;
}

export abstract class ILeaveRepository {
  // --- Leave types ---
  abstract findTypes(includeInactive?: boolean): Promise<LeaveTypeEntity[]>;
  abstract findTypeById(id: string): Promise<LeaveTypeEntity | null>;
  abstract createType(input: CreateLeaveTypeInput): Promise<LeaveTypeEntity>;
  abstract updateType(
    id: string,
    input: UpdateLeaveTypeInput,
  ): Promise<LeaveTypeEntity>;
  abstract softDeleteType(id: string): Promise<LeaveTypeEntity>;
  abstract countRequestsOfType(leaveTypeId: string): Promise<number>;

  // --- Requests ---
  abstract findRequests(
    query: LeaveRequestQueryInput,
  ): Promise<LeaveRequestWithDetails[]>;
  abstract findRequestById(id: string): Promise<LeaveRequestWithDetails | null>;
  abstract submit(input: SubmitLeaveInput): Promise<LeaveRequestWithDetails>;

  /**
   * Approve and write the covered days into `DailyPresence` together — a
   * request marked approved whose days never landed would show the person as
   * absent on leave they were granted.
   */
  abstract approve(
    id: string,
    input: DecideLeaveInput,
    treatment: 'ON_LEAVE' | 'OFFICIAL_DUTY',
    subjectType: PresenceSubjectTypeEnum,
  ): Promise<LeaveRequestWithDetails>;

  abstract reject(
    id: string,
    input: DecideLeaveInput,
  ): Promise<LeaveRequestWithDetails>;
  abstract withdraw(id: string): Promise<LeaveRequestWithDetails>;

  // --- Balances ---
  abstract findBalances(
    userId: string,
    year: number,
  ): Promise<LeaveBalanceRow[]>;
  /** Approved working days already consumed for a type in a year. */
  abstract countUsedDays(
    userId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<number>;
}
