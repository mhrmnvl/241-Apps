import { BaseEntity } from '../../../../shared/domain/base/entity.base.js';
import { StudentStatus } from '../../../../shared/domain/enums/student-status.enum.js';

export class StudentEntity extends BaseEntity<string> {
  private _status: StudentStatus;

  constructor(
    id: string,
    public readonly userId: string,
    public readonly nis: string,
    public readonly nisn: string,
    status: StudentStatus,
    public readonly gradeId: string | null = null,
  ) {
    super(id);
    this._status = status;
  }

  public get status(): StudentStatus {
    return this._status;
  }

  public transitionTo(newStatus: StudentStatus): void {
    if (this._status === newStatus) {
      return;
    }

    if (this._status === StudentStatus.GRADUATED) {
      throw new Error(`Cannot change status of a graduated student.`);
    }

    this._status = newStatus;
  }
}
