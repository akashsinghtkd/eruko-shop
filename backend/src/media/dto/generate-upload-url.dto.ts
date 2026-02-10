import { IsInt, IsOptional, IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  bucket: string;

  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;

  @IsInt()
  fileSize: number;

  @IsString()
  @IsOptional()
  linkedType?: string;

  @IsString()
  @IsOptional()
  linkedId?: string;
}

