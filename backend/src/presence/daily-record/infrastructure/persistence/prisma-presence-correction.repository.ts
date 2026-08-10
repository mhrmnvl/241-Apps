import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CorrectableField,
  PresenceCorrectionEntity,
  PresenceCorrectionWithActor,
} from '../../domain/entities/presence-correction.entity.js';
import {
  IPresenceCorrectionRepository,
  RecordCorrectionInput,
} from '../../domain/interfaces/presence-correction-repository.interface.js';

/** Append-only: nothing edits or removes a correction. */
@Injectable()
export class PrismaPresenceCorrectionRepository implements IPresenceCorrectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordMany(
    inputs: RecordCorrectionInput[],
  ): Promise<PresenceCorrectionEntity[]> {
    if (inputs.length === 0) return [];

    return this.prisma.$transaction(
      inputs.map((input) =>
        this.prisma.presenceCorrection.create({ data: input }),
      ),
    ) as Promise<PresenceCorrectionEntity[]>;
  }

  async findByDailyPresence(
    dailyPresenceId: string,
  ): Promise<PresenceCorrectionWithActor[]> {
    const rows = await this.prisma.presenceCorrection.findMany({
      where: { dailyPresenceId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, profile: { select: { name: true } } } },
      },
    });

    // `field` is a VarChar in the schema; only this module ever writes it, and
    // it writes CorrectableField values.
    return rows.map(({ actor, field, ...correction }) => ({
      ...correction,
      field: field as CorrectableField,
      actor: { id: actor.id, displayName: actor.profile?.name ?? null },
    }));
  }

  /**
   * One query for a whole day's list rather than a lookup per row — the TU
   * screen shows every employee, so an N+1 here is the difference between a
   * page load and a page wait.
   */
  async findCorrectedIds(dailyPresenceIds: string[]): Promise<Set<string>> {
    if (dailyPresenceIds.length === 0) return new Set();

    const rows = await this.prisma.presenceCorrection.findMany({
      where: { dailyPresenceId: { in: dailyPresenceIds } },
      select: { dailyPresenceId: true },
      distinct: ['dailyPresenceId'],
    });

    return new Set(rows.map((row) => row.dailyPresenceId));
  }
}
