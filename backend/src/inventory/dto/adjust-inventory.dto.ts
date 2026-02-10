import { IsInt, IsOptional, IsString } from 'class-validator';

export class AdjustInventoryDto {
  @IsString()
  variantId: string;

  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsInt()
  change: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  note?: string;
}

