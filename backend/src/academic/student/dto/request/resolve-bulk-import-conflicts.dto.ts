import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { BulkImportStudentRowDto } from './bulk-import-student.dto.js';

export class ResolveBulkImportConflictDto {
  @ApiProperty({ description: 'Existing student ID this row conflicts with', required: false })
  @IsOptional()
  @IsUUID()
  existingId?: string;

  @ApiProperty({ enum: ['update', 'skip'] })
  @IsIn(['update', 'skip'])
  action: 'update' | 'skip';

  @ApiProperty({ type: BulkImportStudentRowDto })
  @ValidateNested()
  @Type(() => BulkImportStudentRowDto)
  data: BulkImportStudentRowDto;
}

export class ResolveBulkImportConflictsDto {
  @ApiProperty({ type: [ResolveBulkImportConflictDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResolveBulkImportConflictDto)
  conflicts: ResolveBulkImportConflictDto[];
}
