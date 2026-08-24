import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/** Which year's classrooms to clone, and where to put them. */
export class CopyClassroomsDto {
  @ApiProperty({
    description: 'The year whose classrooms are being copied, e.g. 2026/2027',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceAcademicYearId: string;

  @ApiProperty({
    description: 'The year they are copied into, e.g. 2027/2028',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  targetAcademicYearId: string;
}
