export interface SemesterTypeEntity {
  id: string;
  name: string;
  /** Term order within a year — Ganjil 1, Genap 2. */
  sequence: number;
  isActive: boolean;
  deletedAt?: Date | null;
}
