export interface TeacherPositionEntity {
  id: string;
  teacherId: string;
  positionId: string;
  hireDate: Date;
  isPrimary: boolean;
  deletedAt?: Date | null;
}
