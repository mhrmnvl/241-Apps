import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { CreateCurriculumSubjectDto } from './create-curriculum-subject.dto.js';

export class BulkCreateCurriculumSubjectDto {
  @ApiProperty({
    description: 'Array of curriculum subject entries to create',
    type: [CreateCurriculumSubjectDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCurriculumSubjectDto)
  items: CreateCurriculumSubjectDto[];
}
