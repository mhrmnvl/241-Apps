import { IsOptional, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogQueryDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of logs per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Keyword to search action, resource, ip, userAgent',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by User ID',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by action code',
    example: 'student.create',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Filter by resource',
    example: 'students',
    required: false,
  })
  @IsOptional()
  @IsString()
  resource?: string;
}
