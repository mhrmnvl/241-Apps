import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * What `GET /students/me/classroom` answers with.
 *
 * Documented as its own shape rather than reusing `ClassroomResponseDto`: the
 * classroom travels with the three things a student came for — who runs the
 * class, who teaches it, and who else is in it — and none of those belong on
 * the register's own response.
 */
export class MyClassroomResponseDto {
  @ApiProperty({
    description: 'The classroom the caller is enrolled in',
    type: 'object',
    additionalProperties: true,
  })
  classroom!: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Ketua, wakil, sekretaris and bendahara — null before the class elects them',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  structure!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'The homeroom teacher — null before one is assigned',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  supervisor!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Everyone enrolled in it this term, the caller included',
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  classmates!: Record<string, unknown>[];

  @ApiProperty({
    description: 'What the class is taught this term, and by whom',
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  subjects!: Record<string, unknown>[];
}
