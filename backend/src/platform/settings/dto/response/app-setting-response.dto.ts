import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppKey } from '../../../../shared/domain/enums/app-key.enum.js';

export class AppSettingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: AppKey })
  appKey!: `${AppKey}`;

  @ApiProperty({ example: 'SIAKAD 241' })
  appTitle!: string;

  @ApiProperty({ example: 'Sistem Informasi Akademik' })
  appSubtitle!: string;

  @ApiProperty({ example: 'Masuk ke SIAKAD' })
  loginTitle!: string;

  @ApiProperty({
    example: 'Sistem Informasi Akademik MTs Persis 241 Al-Ikhlash',
  })
  metaDescription!: string;

  @ApiPropertyOptional({
    description: 'Signed, time-limited URL (bucket is private)',
  })
  logoUrl!: string | null;

  @ApiPropertyOptional({
    description: 'Signed, time-limited URL (bucket is private)',
  })
  faviconUrl!: string | null;

  @ApiPropertyOptional()
  contactEmail!: string | null;

  @ApiPropertyOptional()
  contactPhone!: string | null;

  @ApiPropertyOptional()
  footerText!: string | null;

  @ApiProperty()
  maintenanceMode!: boolean;

  @ApiPropertyOptional()
  maintenanceMessage!: string | null;

  @ApiProperty({ type: [String] })
  hiddenMenuKeys!: string[];

  @ApiProperty()
  updatedAt!: Date;
}
