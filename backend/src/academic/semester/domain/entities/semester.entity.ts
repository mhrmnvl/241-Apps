import { BaseEntity } from '../../../../shared/domain/base/entity.base.js';

export class SemesterEntity extends BaseEntity<string> {
  constructor(
    id: string,
    public readonly academicYearId: string,
    public readonly typeId: string,
    public isActive: boolean,
    public startDate: Date | null = null,
    public endDate: Date | null = null,
  ) {
    super(id);
    this.validateDates(startDate, endDate);
  }

  private validateDates(startDate: Date | null, endDate: Date | null): void {
    if (startDate && endDate && endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  public updateDates(startDate: Date | null, endDate: Date | null): void {
    this.validateDates(startDate, endDate);
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }
}
