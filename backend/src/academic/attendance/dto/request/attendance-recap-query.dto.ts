import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AttendanceRecapQueryDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() classroomId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() semesterId: string;
  @ApiPropertyOptional({
    description: 'Month (1-12). Omit for whole-semester recap.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
  @ApiPropertyOptional({ description: 'Year, required together with month.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
