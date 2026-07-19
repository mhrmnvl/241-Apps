import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateClassroomSupervisorDto {
  @ApiProperty({
    description: 'Class ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    description: 'Teacher ID (UUID) � wali kelas',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    description: 'Semester ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsUUID()
  @IsNotEmpty()
  semesterId: string;
}
