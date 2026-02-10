import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @IsOptional()
  authorName?: string;

  @IsInt()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

