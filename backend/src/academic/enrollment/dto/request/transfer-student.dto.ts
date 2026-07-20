import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class TransferStudentDto {
  @ApiProperty({
    description: 'Target classroom ID to transfer the student to',
    format: 'uuid',
  })
  @IsUUID()
  targetClassroomId: string;

  @ApiPropertyOptional({ description: 'Reason for transfer' })
  @IsOptional()
  @IsString()
  note?: string;
}
