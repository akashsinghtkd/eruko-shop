import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoMediaId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

