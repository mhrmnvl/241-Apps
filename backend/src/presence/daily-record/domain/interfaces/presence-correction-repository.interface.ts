import {
  CorrectableField,
  PresenceCorrectionEntity,
  PresenceCorrectionWithActor,
} from '../entities/presence-correction.entity.js';

export type { PresenceCorrectionWithActor };

export interface RecordCorrectionInput {
  dailyPresenceId: string;
  field: CorrectableField;
  previousValue: string | null;
  newValue: string | null;
  reason: string;
  actorId: string;
}

export abstract class IPresenceCorrectionRepository {
  abstract recordMany(
    inputs: RecordCorrectionInput[],
  ): Promise<PresenceCorrectionEntity[]>;
  abstract findByDailyPresence(
    dailyPresenceId: string,
  ): Promise<PresenceCorrectionWithActor[]>;
  /** Which of these days carry any correction, resolved in one query. */
  abstract findCorrectedIds(dailyPresenceIds: string[]): Promise<Set<string>>;
}
