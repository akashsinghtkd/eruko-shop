import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VariantStatus } from './create-variant.dto';

export class UpdateVariantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  attributesJson?: string;

  @IsEnum(VariantStatus)
  @IsOptional()
  status?: VariantStatus;
}

