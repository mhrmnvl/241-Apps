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

export class GraduationYearDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: '2026/2027' }) name: string;
}

/** The list plus the year it came from — reported, never asked for. */
export class GraduationCandidateListDto {
  @ApiProperty({ type: GraduationYearDto, nullable: true })
  academicYear: GraduationYearDto | null;

  @ApiProperty({ example: 'IX', nullable: true })
  finalGradeName: string | null;

  @ApiProperty({ type: [GraduationCandidateDto] })
  students: GraduationCandidateDto[];
}
