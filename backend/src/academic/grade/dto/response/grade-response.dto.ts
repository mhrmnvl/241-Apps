import { ApiProperty } from '@nestjs/swagger';

export class GradeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 7, description: 'Level number for ordering' })
  level: number;

  @ApiProperty({ example: 'VII', description: 'Level display name' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
