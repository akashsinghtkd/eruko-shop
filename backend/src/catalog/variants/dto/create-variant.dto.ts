import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateVariantDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  productId: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  attributesJson?: string;

  @IsEnum(VariantStatus)
  @IsOptional()
  status?: VariantStatus = VariantStatus.ACTIVE;
}

