import { Injectable } from '@nestjs/common';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { AssociateMediaDto } from './dto/associate-media.dto';

@Injectable()
export class MediaService {
  async list() {
    return { items: [], total: 0 };
  }

  async getById(id: string) {
    return { id };
  }

  async generateUploadUrl(dto: GenerateUploadUrlDto) {
    return {
      uploadUrl: 'https://example-upload-url',
      asset: {
        id: 'generated-media-id',
        bucket: dto.bucket,
        path: `generated/path/${dto.fileName}`,
        mimeType: dto.mimeType,
        size: dto.fileSize,
      },
    };
  }

  async associate(id: string, dto: AssociateMediaDto) {
    return { id, ...dto };
  }

  async softDelete(id: string) {
    return;
  }
}

