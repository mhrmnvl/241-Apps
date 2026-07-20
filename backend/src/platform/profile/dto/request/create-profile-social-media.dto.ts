import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProfileSocialMediaDto {
  @ApiProperty({ example: 'uuid-of-platform', format: 'uuid' })
  @IsUUID()
  socialMediaId: string;

  @ApiPropertyOptional({ example: 'ahmad_fauzi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;
}
