import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({ description: 'Expected date of returning the assets' })
  @IsDateString()
  @IsNotEmpty()
  expectedReturnDate: string;

  @ApiProperty({ description: 'Purpose of borrowing' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: 'IDs of the asset units to borrow',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  unitIds: string[];
}
