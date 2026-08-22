import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolUnitStatus } from '../../../../shared/domain/enums/school-unit-status.enum.js';
import { SchoolUnitSocialMediaResponseDto } from './school-unit-social-media-response.dto.js';

export class SchoolUnitResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'MTs Negeri 1 Kota Malang' })
  name!: string;

  @ApiProperty({ example: 'MTsN 1 Malang' })
  surname!: string;

  @ApiProperty({ example: '121235730001' })
  nsm!: string;

  @ApiProperty({ example: '20518057' })
  npsn!: string;

  @ApiProperty({ enum: SchoolUnitStatus, example: 'PUBLIC' })
  status!: SchoolUnitStatus;

  @ApiPropertyOptional({ type: () => [SchoolUnitSocialMediaResponseDto] })
  socialMedias!: SchoolUnitSocialMediaResponseDto[];
}
