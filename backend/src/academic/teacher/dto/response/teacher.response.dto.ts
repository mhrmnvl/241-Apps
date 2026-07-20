import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentTypeResponseDto } from '../../../master-data/employment-type/dto/response/employment-type-response.dto.js';
import { ProfileResponseDto } from '../../../../platform/profile/index.js';

export class TeacherResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiPropertyOptional({ example: '198006152005011001' })
  nip!: string | null;

  @ApiPropertyOptional({ example: '1234567890123456' })
  nuptk!: string | null;

  @ApiProperty({ type: () => EmploymentTypeResponseDto })
  employmentType!: EmploymentTypeResponseDto;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: () => ProfileResponseDto })
  profile!: ProfileResponseDto;
}

export class TeacherListResponseDto {
  @ApiProperty({ type: () => [TeacherResponseDto] })
  data!: TeacherResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 50, totalPages: 5 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
