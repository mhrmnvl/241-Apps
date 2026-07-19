import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTeacherPositionDto {
  @ApiProperty({
    description: 'Position ID (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440007',
  })
  @IsNotEmpty()
  @IsUUID()
  positionId: string;

  @ApiProperty({ example: '2020-01-01', description: 'Hire/assignment date' })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateTeacherPositionDto {
  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
