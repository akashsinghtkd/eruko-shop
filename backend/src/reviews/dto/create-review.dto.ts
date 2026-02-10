import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  authorName: string;

  @IsInt()
  rating: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  body: string;

  @IsString()
  @IsOptional()
  status?: string;
}

