import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class BulkTransferStudentDto {
  @ApiProperty({
    description: 'Array of enrollment IDs to transfer',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  enrollmentIds: string[];

  @ApiProperty({
    description: 'Target classroom ID to transfer students to',
    format: 'uuid',
  })
  @IsUUID()
  targetClassroomId: string;

  @ApiPropertyOptional({ description: 'Reason for transfer' })
  @IsOptional()
  @IsString()
  note?: string;
}
