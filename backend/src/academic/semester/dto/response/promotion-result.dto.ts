import { ApiProperty } from '@nestjs/swagger';

export class PromotionResultDto {
  @ApiProperty() promoted: number;
  @ApiProperty() repeated: number;
  @ApiProperty() skipped: number;
}
