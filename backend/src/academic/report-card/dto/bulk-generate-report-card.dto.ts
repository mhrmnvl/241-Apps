import { IsUUID } from 'class-validator';

export class BulkGenerateReportCardDto {
  @IsUUID()
  classroomId: string;

  @IsUUID()
  semesterId: string;
}
