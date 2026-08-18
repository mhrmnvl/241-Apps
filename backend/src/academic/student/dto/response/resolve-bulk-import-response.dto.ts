import { ApiProperty } from '@nestjs/swagger';

export class ResolveBulkImportErrorDto {
  @ApiProperty()
  existingId: string;

  @ApiProperty()
  error: string;
}

export class ResolveBulkImportResponseDto {
  @ApiProperty({ example: 5, description: 'Total rows submitted' })
  total: number;

  @ApiProperty({ example: 3, description: 'Rows created or updated' })
  updated: number;

  @ApiProperty({ example: 2, description: 'Rows the caller chose to skip' })
  skipped: number;

  @ApiProperty({ example: 0, description: 'Rows that threw while processing' })
  failed: number;

  @ApiProperty({ type: [ResolveBulkImportErrorDto] })
  errors: ResolveBulkImportErrorDto[];
}
