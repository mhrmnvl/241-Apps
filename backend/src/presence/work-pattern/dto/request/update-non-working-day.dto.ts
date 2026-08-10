import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNonWorkingDayDto {
  @ApiProperty({ example: 'Libur Semester' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;
}
