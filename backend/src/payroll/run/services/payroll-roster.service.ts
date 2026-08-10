import { Injectable } from '@nestjs/common';
import { ITeacherRepository } from '../../../academic/teacher/domain/interfaces/teacher-repository.interface.js';

export interface RosterMember {
  userId: string;
  displayName: string | null;
}

/**
 * Who payroll pays.
 *
 * Deliberately unfiltered by position, position category, or employment type: a
 * position the school adds next year is in payroll the day someone is assigned
 * to it, with no code change (FR-055, FR-056). Creating a run and recalculating
 * one share this so the two can never disagree about who is on the roster.
 */
@Injectable()
export class PayrollRosterService {
  constructor(private readonly teachers: ITeacherRepository) {}

  async list(): Promise<RosterMember[]> {
    const employees = await this.teachers.findAllForExport({ isActive: true });

    return employees.map((employee) => ({
      userId: employee.userId,
      displayName: employee.user.profile?.name ?? null,
    }));
  }

  /** Names, not UUIDs — the operator has to go and fix these people. */
  name(roster: RosterMember[], userIds: string[]): string[] {
    const byId = new Map(
      roster.map((member) => [member.userId, member.displayName]),
    );

    return userIds.map((userId) => byId.get(userId) ?? userId);
  }
}
