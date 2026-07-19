import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveActionDto {
  @ApiProperty({
    description: 'Action to perform: APPROVE or REJECT',
    enum: ['APPROVE', 'REJECT'],
  })
  @IsIn(['APPROVE', 'REJECT'])
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Optional rejection or approval note' })
  @IsString()
  @IsOptional()
  note?: string;
}
