import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStudentEnrollmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  semesterId: string;
}
