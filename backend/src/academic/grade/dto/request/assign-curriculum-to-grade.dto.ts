import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignCurriculumToGradeDto {
  @ApiProperty({ description: 'Grade ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

  @ApiProperty({ description: 'Academic Year ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Curriculum ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  curriculumId: string;
}
