import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

export class ProfileSocialMediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by role code' })
  @IsOptional()
  @IsString()
  roleCode?: string;

  @ApiPropertyOptional({
    description: 'Search by profile name or social media username',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
