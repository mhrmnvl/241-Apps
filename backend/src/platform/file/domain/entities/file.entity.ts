export interface FileEntity {
  id: string;
  categoryId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}
