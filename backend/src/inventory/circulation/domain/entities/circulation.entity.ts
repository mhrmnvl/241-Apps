export interface InventoryBorrowingEntity {
  id: string;
  assetUnitId: string;
  borrowerUserId: string;
  borrowDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date | null;
  status: string;
  notes?: string | null;
  deletedAt?: Date | null;
}

export interface InventoryMaintenanceEntity {
  id: string;
  assetUnitId: string;
  reporterUserId: string;
  startDate: Date;
  completionDate?: Date | null;
  cost?: number | null;
  description: string;
  status: string;
  deletedAt?: Date | null;
}
