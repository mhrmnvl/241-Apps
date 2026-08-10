import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSalaryComponentDto } from './create-salary-component.dto.js';

export class UpdateSalaryComponentDto extends PartialType(
  CreateSalaryComponentDto,
) {
  @ApiPropertyOptional({ description: 'Deactivating stops new assignments' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
