import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateReportCardDto {
  @IsOptional()
  @IsString()
  teacherNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;

  /**
   * `isPublished` is deliberately absent.
   *
   * Publishing is `PATCH :id/publish`, which refuses a report card with no
   * calculated average and asks for `report-cards.publish`. Accepting the flag
   * here let a caller holding only `report-cards.update` skip both — and a
   * published report card is what a parent sees through `GET /rapors/me`.
   */
}
