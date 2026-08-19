import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { AttendanceStatus } from '../../../../shared/domain/enums/attendance-status.enum.js';
import {
  AttendanceEntity,
  AttendanceWithDetails,
} from '../entities/attendance.entity.js';

export type { AttendanceWithDetails };

export interface AttendanceQueryInput extends PaginationQueryInput {
  status?: AttendanceStatus;
  enrollmentId?: string;
  scheduleId?: string;
  classroomId?: string;
  semesterId?: string;
  date?: string;
  /**
   * One student's own rows, across their enrolments. Set by the self-service
   * read from the signed-in account, never from anything the caller sends.
   */
  studentId?: string;
}

export interface CreateAttendanceRepositoryInput {
  enrollmentId: string;
  date: Date;
  status: AttendanceStatus;
  scheduleId?: string | null;
  note?: string | null;
}

export interface UpdateAttendanceRepositoryInput {
  status?: AttendanceStatus;
  note?: string | null;
}

/** Restoring a soft-deleted row always re-asserts a status. */
export interface RestoreAttendanceRepositoryInput {
  status: AttendanceStatus;
  note?: string | null;
}

/** One row of a bulk attendance submission for a single date. */
export interface BulkAttendanceRecord {
  enrollmentId: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface BulkAttendanceResult {
  saved: number;
}

/** Whole-semester recap unless both month and year are supplied. */
export interface AttendanceRecapQueryInput {
  classroomId: string;
  semesterId: string;
  month?: number;
  year?: number;
}

export interface AttendanceTrendQueryInput {
  classroomId: string;
  semesterId: string;
}

export interface AttendanceRecapRow {
  enrollmentId: string;
  studentName?: string;
  PRESENT: number;
  SICK: number;
  EXCUSED: number;
  ABSENT: number;
  LATE: number;
  total: number;
  percentage: number;
}

export interface AttendanceMonthlyTrendPoint {
  year: number;
  month: number;
  monthLabel: string;
  PRESENT: number;
  SICK: number;
  EXCUSED: number;
  ABSENT: number;
  LATE: number;
  total: number;
  percentage: number;
}

export interface AttendanceStatusCounts {
  sick: number;
  excused: number;
  absent: number;
}

export abstract class IAttendanceRepository {
  abstract findAll(
    query: AttendanceQueryInput,
  ): Promise<PaginatedResult<AttendanceWithDetails>>;
  abstract findById(id: string): Promise<AttendanceWithDetails | null>;
  abstract findAttendance(
    teachingAssignmentId: string,
    studentEnrollmentId: string,
    date: Date,
    excludeId?: string,
  ): Promise<AttendanceEntity | null>;
  abstract create(
    input: CreateAttendanceRepositoryInput,
  ): Promise<AttendanceWithDetails>;
  abstract update(
    id: string,
    input: UpdateAttendanceRepositoryInput,
  ): Promise<AttendanceWithDetails>;
  abstract remove(id: string): Promise<AttendanceEntity>;
  abstract softDelete(id: string): Promise<AttendanceEntity>;
  abstract restore(
    id: string,
    input: RestoreAttendanceRepositoryInput,
  ): Promise<AttendanceEntity>;
  abstract findDuplicate(
    enrollmentId: string,
    date: Date | string,
    scheduleId?: string,
    excludeId?: string,
  ): Promise<AttendanceEntity | null>;
  abstract findSoftDeleted(
    enrollmentId: string,
    date: Date | string,
    scheduleId?: string,
  ): Promise<AttendanceEntity | null>;
  abstract bulkUpsert(
    date: Date,
    records: BulkAttendanceRecord[],
    scheduleId?: string,
  ): Promise<BulkAttendanceResult>;
  abstract getStatusCounts(
    enrollmentId: string,
  ): Promise<AttendanceStatusCounts>;
  abstract getRecap(
    query: AttendanceRecapQueryInput,
  ): Promise<AttendanceRecapRow[]>;
  abstract getMonthlyTrend(
    query: AttendanceTrendQueryInput,
  ): Promise<AttendanceMonthlyTrendPoint[]>;
}
