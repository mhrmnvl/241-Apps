import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateConditionDto {
  @ApiProperty({ example: 'COND-GOOD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Baik' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isUsable?: boolean;
}

export class UpdateConditionDto extends PartialType(CreateConditionDto) {}
