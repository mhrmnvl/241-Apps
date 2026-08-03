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
