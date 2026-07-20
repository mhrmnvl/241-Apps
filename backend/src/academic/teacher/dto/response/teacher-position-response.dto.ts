import { ApiProperty } from '@nestjs/swagger';

export class TeacherPositionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Position UUID',
  })
  positionId!: string;

  @ApiProperty({ example: '2020-01-01' })
  hireDate!: string;

  @ApiProperty({ example: false })
  isPrimary!: boolean;
}
