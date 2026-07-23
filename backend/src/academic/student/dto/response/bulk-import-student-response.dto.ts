import { ApiProperty } from '@nestjs/swagger';
import { BulkImportStudentRowDto } from '../request/bulk-import-student.dto.js';

export class BulkImportRowResultDto {
  @ApiProperty({ example: 2, description: 'Excel row number (1 = header)' })
  row: number;

  @ApiProperty({
    example: 'SUCCESS',
    enum: ['SUCCESS', 'FAILED', 'CONFLICT'],
    description:
      'CONFLICT means the row matches an existing student by NIS/NISN. ' +
      'It is not applied automatically — resend it to the resolve endpoint ' +
      'with an "update" or "skip" decision.',
  })
  status: 'SUCCESS' | 'FAILED' | 'CONFLICT';

  @ApiProperty({ example: 'siswa001', required: false })
  identifier?: string;

  @ApiProperty({
    required: false,
    example:
      'Validation failed: identifier must not be empty; nis must not be empty',
    description: 'Error detail. Present when status is FAILED or CONFLICT.',
  })
  error?: string;

  @ApiProperty({
    required: false,
    description: 'Existing student ID this row conflicts with.',
  })
  existingId?: string;

  @ApiProperty({
    required: false,
    type: BulkImportStudentRowDto,
    description:
      'The parsed row data, echoed back so the client can resend it to the ' +
      'resolve endpoint without re-parsing the Excel file.',
  })
  data?: BulkImportStudentRowDto;
}

export class BulkImportStudentsResponseDto {
  @ApiProperty({ example: 10, description: 'Total rows processed' })
  total: number;

  @ApiProperty({ example: 8 })
  success: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({
    example: 1,
    description: 'Rows skipped because they match an existing student.',
  })
  conflict: number;

  @ApiProperty({
    type: [BulkImportRowResultDto],
    description:
      'Per-row result. Failed rows include row number and error detail.',
  })
  results: BulkImportRowResultDto[];
}
