import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AssessmentType } from '../../../../shared/domain/enums/assessment-type.enum.js';

export class AssessmentWeightRecordDto {
  @ApiProperty({ enum: AssessmentType })
  @IsEnum(AssessmentType)
  type: AssessmentType;

  @ApiProperty({
    description: 'Percentage this type contributes to the subject score',
    example: 40,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}

export class ReplaceAssessmentWeightsDto {
  @ApiProperty({ description: 'The class and subject these weights apply to' })
  @IsUUID()
  @IsNotEmpty()
  teachingAssignmentId: string;

  @ApiProperty({
    type: [AssessmentWeightRecordDto],
    description:
      'The complete set. Types left out contribute nothing. The listed weights must total 100.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => AssessmentWeightRecordDto)
  weights: AssessmentWeightRecordDto[];
}
