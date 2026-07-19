import { Attendance, AttendanceStatus, Prisma } from '@prisma/client';
import type {
  AttendanceQueryDto,
  AttendanceRecapQueryDto,
  BulkAttendanceRecordDto,
} from '../../dto/attendance.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ATTENDANCE_INCLUDE = {
  enrollment: {
    include: {
      student: {
        include: { user: { select: { profile: true } } },
      },
    },
  },
  schedule: { include: { timeSlot: true } },
} satisfies Prisma.AttendanceInclude;

export type AttendanceWithDetails = Prisma.AttendanceGetPayload<{
  include: typeof ATTENDANCE_INCLUDE;
}>;

export interface AttendanceRecap {
  enrollmentId: string;
  studentName: string;
  nis: string;
  PRESENT: number;
  SICK: number;
  EXCUSED: number;
  ABSENT: number;
  LATE: number;
}

export abstract class IAttendanceRepository {
  abstract findAll(
    query: AttendanceQueryDto,
  ): Promise<PaginatedResult<AttendanceWithDetails>>;

  abstract findById(id: string): Promise<AttendanceWithDetails | null>;

  abstract findDuplicate(
    enrollmentId: string,
    date: Date,
    scheduleId?: string,
    excludeId?: string,
  ): Promise<Attendance | null>;

  abstract create(data: {
    enrollmentId: string;
    date: Date;
    status: AttendanceStatus;
    scheduleId?: string;
    note?: string;
  }): Promise<Attendance>;

  abstract update(
    id: string,
    data: Prisma.AttendanceUpdateInput,
  ): Promise<Attendance>;

  abstract findSoftDeleted(
    enrollmentId: string,
    date: Date,
    scheduleId?: string,
  ): Promise<Attendance | null>;

  abstract restore(
    id: string,
    data: { status: AttendanceStatus; note?: string },
  ): Promise<Attendance>;

  abstract softDelete(id: string): Promise<Attendance>;

  abstract bulkUpsert(
    date: Date,
    records: BulkAttendanceRecordDto[],
    scheduleId?: string,
  ): Promise<{ saved: number }>;

  abstract getRecap(query: AttendanceRecapQueryDto): Promise<AttendanceRecap[]>;
}
