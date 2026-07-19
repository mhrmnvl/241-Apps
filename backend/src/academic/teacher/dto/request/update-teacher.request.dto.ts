import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateTeacherDto {
  @ApiPropertyOptional({ example: '198006152005011001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nip?: string;

  @ApiPropertyOptional({ example: '1234567890123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nuptk?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440007' })
  @IsOptional()
  @IsUUID()
  employmentTypeId?: string;
}
