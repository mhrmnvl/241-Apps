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
