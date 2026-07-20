import { ApiProperty } from '@nestjs/swagger';

export class BulkImportTeacherRowResultDto {
  @ApiProperty({ example: 2, description: 'Excel row number (1 = header)' })
  row: number;

  @ApiProperty({ example: 'SUCCESS', enum: ['SUCCESS', 'FAILED'] })
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({ example: 'guru001', required: false })
  identifier?: string;

  @ApiProperty({
    required: false,
    example: 'Validation failed: identifier must not be empty',
    description: 'Error detail. Present only when status is FAILED.',
  })
  error?: string;
}

export class BulkImportTeachersResponseDto {
  @ApiProperty({ example: 10, description: 'Total rows processed' })
  total: number;

  @ApiProperty({ example: 8 })
  success: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({
    type: [BulkImportTeacherRowResultDto],
    description:
      'Per-row result. Failed rows include row number and error detail.',
  })
  results: BulkImportTeacherRowResultDto[];
}
