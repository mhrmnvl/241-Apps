import { ApiProperty } from '@nestjs/swagger';

export class GraduationCandidateDto {
  @ApiProperty() studentId: string;
  @ApiProperty() studentName: string;
  @ApiProperty() nis: string;
  @ApiProperty() classroomId: string;
  @ApiProperty() classroomName: string;
  @ApiProperty() gradeName: string;
}

export class BulkGraduationResultDto {
  @ApiProperty() graduated: number;

  @ApiProperty({ description: 'Already held a graduation record' })
  skipped: number;
}
