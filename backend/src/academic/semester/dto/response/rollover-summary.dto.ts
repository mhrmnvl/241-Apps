export class RolloverCategoryResultDto {
  created: number;
  skipped: number;
}

export class RolloverSummaryDto {
  classrooms: RolloverCategoryResultDto;
  enrollments: RolloverCategoryResultDto;
  supervisors: RolloverCategoryResultDto;
  teachingAssignments: RolloverCategoryResultDto;
  schedules: RolloverCategoryResultDto;
}
