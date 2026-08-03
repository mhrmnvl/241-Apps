import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';

export interface TimeSlotTypeEntity {
  id: string;
  code: string;
  name: string;
  isLesson: boolean;
  days: DayEnum[] | string[];
  deletedAt?: Date | null;
}
