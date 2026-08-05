import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * One teacher teaching one subject, in one or more classrooms, for a semester.
 *
 * Classrooms are a list because a teacher usually takes the same subject in
 * several classes at once. Each entry still becomes its own assignment row, so
 * a different teacher can be set per class afterwards.
 */
export class CreateTeachingAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    description: 'One assignment row is created per classroom',
    type: [String],
    format: 'uuid',
    example: ['uuid-class-vii-a', 'uuid-class-vii-b'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  classroomIds: string[];

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  semesterId: string;
}
