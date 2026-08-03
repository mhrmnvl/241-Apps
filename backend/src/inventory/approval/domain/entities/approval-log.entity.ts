/** One recorded approver action against a step of a running approval. */
export interface ApprovalLogEntity {
  id: string;
  instanceId: string;
  stepSequence: number;
  approverId: string;
  actionId: string;
  note?: string | null;
  createdAt: Date;
}
