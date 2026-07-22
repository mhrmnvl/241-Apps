import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReturnLoanItemDto {
  @ApiProperty({ description: 'Asset unit ID being returned' })
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ description: 'Condition ID of the asset when returned' })
  @IsUUID()
  @IsNotEmpty()
  returnedConditionId: string;

  @ApiProperty({ description: 'Notes on returning the asset' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReturnLoanDto {
  @ApiProperty({ type: [ReturnLoanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnLoanItemDto)
  items: ReturnLoanItemDto[];
}
