export interface FileCategoryEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  deletedAt?: Date | null;
}
