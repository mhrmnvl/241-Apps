import { PresenceDayStatus, PresenceValueSource } from '@prisma/client';
import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';

export type PresenceDayStatusEnum = `${PresenceDayStatus}`;
export type PresenceValueSourceEnum = `${PresenceValueSource}`;

export interface DailyPresenceEntity {
  id: string;
  userId: string;
  subjectType: PresenceSubjectTypeEnum;
  date: Date;
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  checkInSource?: PresenceValueSourceEnum | null;
  checkOutSource?: PresenceValueSourceEnum | null;
  status: PresenceDayStatusEnum;
  statusSource: PresenceValueSourceEnum;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workPatternId?: string | null;
  leaveRequestId?: string | null;
  note?: string | null;
  deletedAt?: Date | null;
}

/** What the kiosk shows the person standing at the gate. */
export interface ScanFeedback {
  direction: 'CHECK_IN' | 'CHECK_OUT' | 'NONE';
  dayStatus: PresenceDayStatusEnum;
  lateMinutes: number;
  recordedAt: Date;
}
