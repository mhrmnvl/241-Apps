/** Uploaded file attached to an admission record (document or payment proof). */
export interface AdmissionFileRef {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}
