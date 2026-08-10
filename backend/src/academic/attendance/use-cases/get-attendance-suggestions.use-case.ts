import { Injectable, Logger } from '@nestjs/common';
import {
  GateSuggestion,
  IDailyPresenceReadPort,
} from '../../../presence/daily-record/domain/interfaces/daily-presence-read.port.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { AttendanceSuggestionQueryDto } from '../dto/request/attendance-suggestion-query.dto.js';

export interface AttendanceSuggestion {
  enrollmentId: string;
  /** What the gate saw, mapped to the per-lesson vocabulary. */
  suggestedStatus: 'PRESENT' | 'LATE';
  checkInAt: Date | null;
  lateMinutes: number;
}

export interface AttendanceSuggestionResult {
  date: string;
  /** Pre-filled from the gate. Unconfirmed until a teacher saves. */
  suggestions: AttendanceSuggestion[];
  /**
   * Enrolments the gate saw nothing for. Surfaced explicitly so the screen can
   * flag them as needing a decision rather than defaulting them to absent
   * (FR-018) — the gate being silent is not evidence of anything.
   */
  unscannedEnrollmentIds: string[];
  /** False when presence could not be reached; the screen degrades quietly. */
  available: boolean;
}

@Injectable()
export class GetAttendanceSuggestionsUseCase {
  private readonly logger = new Logger(GetAttendanceSuggestionsUseCase.name);

  constructor(
    private readonly enrollments: IEnrollmentRepository,
    private readonly presence: IDailyPresenceReadPort,
  ) {}

  /**
   * What the gate saw for one class on one date, as a suggestion.
   *
   * **This writes nothing.** A gate scan never creates a per-lesson attendance
   * row; the teacher's save is the only thing that writes (FR-020, FR-022,
   * research R6). Presence is asked, not told.
   *
   * The suggestion is keyed by enrolment because that is what the class screen
   * and the attendance table work in — presence keys on `userId` and does not
   * know classrooms exist, so this use case is where the two vocabularies meet.
   */
  async execute(
    query: AttendanceSuggestionQueryDto,
  ): Promise<AttendanceSuggestionResult> {
    const enrolled = await this.enrollments.findAll({
      classroomId: query.classroomId,
      semesterId: query.semesterId,
      limit: 1000,
    });

    const byUserId = new Map<string, string>();
    for (const enrollment of enrolled.data) {
      if (enrollment.student?.userId) {
        byUserId.set(enrollment.student.userId, enrollment.id);
      }
    }

    const allEnrollmentIds = [...byUserId.values()];
    const date = new Date(query.date);

    let gate: GateSuggestion[];
    try {
      gate = await this.presence.findByUsersAndDate([...byUserId.keys()], date);
    } catch (error) {
      // Presence being unavailable must not stop a teacher taking attendance.
      // The screen falls back to exactly what it did before this feature: every
      // student needing a decision. A degraded convenience, not a degraded
      // record (contracts/internal-ports.md, Port 1).
      this.logger.warn(
        `Gate suggestions unavailable for classroom ${query.classroomId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return {
        date: query.date,
        suggestions: [],
        unscannedEnrollmentIds: allEnrollmentIds,
        available: false,
      };
    }

    const suggestions: AttendanceSuggestion[] = [];
    const scanned = new Set<string>();

    for (const record of gate) {
      const enrollmentId = byUserId.get(record.userId);
      if (!enrollmentId) continue;

      // Only an actual arrival is a suggestion. ON_LEAVE, ABSENT and
      // NOT_EXPECTED are the gate's view of the *day*, and the teacher owns
      // what happened in the lesson — offering them as a pre-fill would put
      // the gate's opinion into the report card.
      if (record.status !== 'PRESENT' && record.status !== 'LATE') continue;

      scanned.add(enrollmentId);
      suggestions.push({
        enrollmentId,
        suggestedStatus: record.status,
        checkInAt: record.checkInAt,
        lateMinutes: record.lateMinutes,
      });
    }

    return {
      date: query.date,
      suggestions,
      unscannedEnrollmentIds: allEnrollmentIds.filter((id) => !scanned.has(id)),
      available: true,
    };
  }
}
