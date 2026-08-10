import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateLeaveTypeDto } from './create-leave-type.dto.js';

export class UpdateLeaveTypeDto extends PartialType(CreateLeaveTypeDto) {
  @ApiPropertyOptional({ description: 'Deactivating stops new requests' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
