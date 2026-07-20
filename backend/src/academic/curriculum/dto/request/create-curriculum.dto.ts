import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCurriculaDto {
  @ApiProperty({
    description: 'Academic Year ID',
    example: '550e8400-e29b-41d4-a716-446655440009',
  })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({
    description: 'Curriculum Name',
    example: 'Kurikulum Merdeka',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Active Status' })
  @IsOptional()
  isActive?: boolean;
}
