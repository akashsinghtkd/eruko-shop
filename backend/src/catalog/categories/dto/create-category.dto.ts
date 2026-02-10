import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsInt()
  @IsOptional()
  sortOrder?: number = 0;
}

