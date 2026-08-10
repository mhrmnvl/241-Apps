import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CredentialPrintQueryDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description: 'Comma-separated on the query string',
  })
  @Transform(({ value }): string[] =>
    typeof value === 'string' ? value.split(',') : (value as string[]),
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds!: string[];
}
