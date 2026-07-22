import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class StudentScoreRosterQueryDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() assessmentItemId: string;
}
