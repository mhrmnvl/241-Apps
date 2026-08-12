import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BulkGenerateReportCardDto {
  @ApiProperty({ description: 'Classroom whose active enrolments are graded' })
  @IsUUID()
  classroomId: string;

  @ApiProperty({ description: 'Semester the report cards belong to' })
  @IsUUID()
  semesterId: string;
}
