import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AttendanceTrendQueryDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() classroomId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() semesterId: string;
}
