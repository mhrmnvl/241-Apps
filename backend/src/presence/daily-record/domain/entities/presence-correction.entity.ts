/** Which field a correction changed. Serialised values, so one shape fits all. */
export type CorrectableField = 'checkInAt' | 'checkOutAt' | 'status' | 'note';

export interface PresenceCorrectionEntity {
  id: string;
  dailyPresenceId: string;
  field: CorrectableField;
  previousValue?: string | null;
  newValue?: string | null;
  reason: string;
  actorId: string;
  createdAt: Date;
}

export interface CorrectionActorRef {
  id: string;
  displayName: string | null;
}

export interface PresenceCorrectionWithActor extends PresenceCorrectionEntity {
  actor: CorrectionActorRef;
}
