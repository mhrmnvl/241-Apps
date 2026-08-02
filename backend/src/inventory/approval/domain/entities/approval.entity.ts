export interface InventoryApprovalEntity {
  id: string;
  requestType: string;
  requestId: string;
  approverUserId?: string | null;
  status: string;
  notes?: string | null;
  approvedAt?: Date | null;
  deletedAt?: Date | null;
}
