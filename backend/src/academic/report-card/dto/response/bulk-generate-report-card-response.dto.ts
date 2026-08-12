import { ApiProperty } from '@nestjs/swagger';

export class BulkGenerateReportCardResponseDto {
  @ApiProperty({ description: 'Active enrolments considered' })
  total!: number;

  @ApiProperty({ description: 'Report cards generated or regenerated' })
  generated!: number;

  @ApiProperty({
    description: 'Enrolments left alone because their card is published',
  })
  skipped!: number;

  @ApiProperty({
    description: 'Enrolment ids whose card was left published and untouched',
    type: [String],
  })
  skippedEnrollmentIds!: string[];
}
