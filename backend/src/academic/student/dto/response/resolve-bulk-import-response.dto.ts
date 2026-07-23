import { ApiProperty } from '@nestjs/swagger';

export class ResolveBulkImportErrorDto {
  @ApiProperty()
  existingId: string;

  @ApiProperty()
  error: string;
}

export class ResolveBulkImportResponseDto {
  @ApiProperty({ example: 5, description: 'Total conflicts resolved' })
  total: number;

  @ApiProperty({ example: 3 })
  updated: number;

  @ApiProperty({ example: 2 })
  skipped: number;

  @ApiProperty({ type: [ResolveBulkImportErrorDto] })
  errors: ResolveBulkImportErrorDto[];
}
