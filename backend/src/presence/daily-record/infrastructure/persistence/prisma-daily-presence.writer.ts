import { PrismaService } from '../../../../core/database/prisma.service.js';
import { DailyPresenceEntity } from '../../domain/entities/daily-presence.entity.js';
import {
  CorrectPresenceInput,
  ManualPresenceInput,
  RecordCheckOutInput,
  UpsertCheckInInput,
} from '../../domain/interfaces/daily-presence-repository.interface.js';

/**
 * Every write to a presence day.
 *
 * Split from the reads because the rules that matter here are all about what a
 * write must *not* overwrite, and they are easier to see together than
 * scattered between queries.
 */

/**
 * The first accepted scan of a person's day. Upsert rather than create so a
 * retried flush after a partially applied batch does not fail on the
 * one-row-per-person-per-day index.
 *
 * **An approved-leave day keeps its status.** Somebody who comes in anyway on
 * leave has their arrival recorded, but the day stays ON_LEAVE — overwriting it
 * would silently revoke leave that was formally granted, and that status is
 * what payroll reads. The conflict is surfaced instead (FR-034).
 */
export async function upsertCheckIn(
  prisma: PrismaService,
  existing: DailyPresenceEntity | null,
  input: UpsertCheckInInput,
): Promise<DailyPresenceEntity> {
  const {
    userId,
    subjectType,
    date,
    checkInAt,
    status,
    lateMinutes,
    workPatternId,
    source,
  } = input;

  if (existing) {
    const onApprovedLeave = existing.leaveRequestId !== null;

    return prisma.dailyPresence.update({
      where: { id: existing.id },
      data: {
        checkInAt,
        checkInSource: source,
        workPatternId,
        ...(onApprovedLeave
          ? {}
          : { status, statusSource: source, lateMinutes }),
      },
    });
  }

  return prisma.dailyPresence.create({
    data: {
      userId,
      subjectType,
      date,
      checkInAt,
      checkInSource: source,
      status,
      statusSource: source,
      lateMinutes,
      workPatternId,
    },
  });
}

export async function recordCheckOut(
  prisma: PrismaService,
  input: RecordCheckOutInput,
): Promise<DailyPresenceEntity> {
  const { id, checkOutAt, earlyLeaveMinutes, source } = input;

  return prisma.dailyPresence.update({
    where: { id },
    data: { checkOutAt, checkOutSource: source, earlyLeaveMinutes },
  });
}

export async function createManual(
  prisma: PrismaService,
  input: ManualPresenceInput,
): Promise<DailyPresenceEntity> {
  return prisma.dailyPresence.create({
    data: {
      ...input,
      checkInSource: input.checkInAt ? 'MANUAL' : null,
      checkOutSource: input.checkOutAt ? 'MANUAL' : null,
      statusSource: 'MANUAL',
    },
  });
}

/**
 * Each touched field flips its own source to MANUAL. An untouched field keeps
 * whatever it had, so a corrected arrival on a scanned day still shows the
 * departure as scanned (FR-014).
 */
export async function correct(
  prisma: PrismaService,
  id: string,
  input: CorrectPresenceInput,
): Promise<DailyPresenceEntity> {
  return prisma.dailyPresence.update({
    where: { id },
    data: {
      ...(input.checkInAt !== undefined && {
        checkInAt: input.checkInAt,
        checkInSource: 'MANUAL',
      }),
      ...(input.checkOutAt !== undefined && {
        checkOutAt: input.checkOutAt,
        checkOutSource: 'MANUAL',
      }),
      ...(input.status !== undefined && {
        status: input.status,
        statusSource: 'MANUAL',
      }),
      ...(input.note !== undefined && { note: input.note }),
    },
  });
}
