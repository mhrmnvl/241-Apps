import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateRecommendationDto {
  @ApiProperty({
    description: 'Source semester ID (current semester)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceSemesterId: string;

  @ApiProperty({
    description: 'Target semester ID (next academic year semester)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  targetSemesterId: string;
}
