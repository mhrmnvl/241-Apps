import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({
    description: 'Label / name for this time slot',
    example: 'Jam ke-1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Start time in HH:MM format', example: '07:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '07:30' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: 'Sort order', example: 1 })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'ID of the time slot type',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440008',
  })
  @IsUUID()
  @IsNotEmpty()
  typeId: string;
}
