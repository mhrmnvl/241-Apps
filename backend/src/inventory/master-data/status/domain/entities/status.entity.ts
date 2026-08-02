export interface InventoryStatusEntity {
  id: string;
  code: string;
  name: string;
  systemKey?: string | null;
  deletedAt?: Date | null;
}
