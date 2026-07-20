import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SEGMENT = /^[a-z0-9-]+$/;

export class CreatePermissionDto {
  @ApiProperty({
    example: 'inventory',
    description: 'Module / resource (lowercase letters, digits, hyphens)',
  })
  @IsString()
  @Matches(SEGMENT, {
    message: 'module must be lowercase letters, digits, or hyphens',
  })
  @MaxLength(50)
  module!: string;

  @ApiProperty({
    example: 'export',
    description: 'Action (lowercase letters, digits, hyphens)',
  })
  @IsString()
  @Matches(SEGMENT, {
    message: 'action must be lowercase letters, digits, or hyphens',
  })
  @MaxLength(50)
  action!: string;

  @ApiPropertyOptional({ example: 'Export inventory data' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
