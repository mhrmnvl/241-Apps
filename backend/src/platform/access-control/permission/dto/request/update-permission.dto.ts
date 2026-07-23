import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Only the human-facing description is editable. A permission's code
 * (module.action) is the key referenced by `@RequirePermissions(...)` guards, so
 * it is immutable — changing it would silently break authorization.
 */
export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'Export inventory data to CSV' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
