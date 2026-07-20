import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ example: 'Kepala Sekolah' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
