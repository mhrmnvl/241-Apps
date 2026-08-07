import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'olimpiade', maxLength: 60 })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;
}

/** Only the label changes. The slug is an address that may already be shared. */
export class UpdateTagDto {
  @ApiProperty({ example: 'Olimpiade', maxLength: 60 })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;
}

export class TagQueryDto {
  @ApiPropertyOptional({ description: 'Matches the tag label' })
  @IsOptional()
  @IsString()
  search?: string;
}
