import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParentRelation } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateStudentParentDto {
  @ApiPropertyOptional({ enum: ParentRelation })
  @IsOptional()
  @IsEnum(ParentRelation)
  relation?: ParentRelation;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
