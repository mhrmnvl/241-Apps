import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/**
 * Editing one existing assignment, so the classroom is singular here — unlike
 * creation, which fans a teacher across several classes at once. Declared in
 * full rather than derived from the create DTO, which would inherit the plural
 * `classroomIds` and let a single row be pointed at many classes.
 */
export class UpdateTeachingAssignmentDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @ApiPropertyOptional({
    description:
      "Overrides the subject's KKM for this class only. Send null to fall back to the subject default.",
    example: 72,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  kkm?: number | null;
}
