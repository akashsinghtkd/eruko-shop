import { IsString } from 'class-validator';

export class AssociateMediaDto {
  @IsString()
  linkedType: string;

  @IsString()
  linkedId: string;
}

