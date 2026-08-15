import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @ApiPropertyOptional({
    description:
      'Forward this loan to the next approver instead of finishing here. ' +
      'Only meaningful when the next step is optional — a mandatory one is ' +
      'always taken, and this cannot waive it. Ignored on a rejection.',
  })
  @IsBoolean()
  @IsOptional()
  forwardToNextApprover?: boolean;
}
