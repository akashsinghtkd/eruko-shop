import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { AssociateMediaDto } from './dto/associate-media.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Permissions('media.read')
  @Get()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.mediaService.list();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('media.read')
  @Get(':id')
  async getById(@Param('id') id: string) {
    const asset = await this.mediaService.getById(id);
    return { data: asset };
  }

  @Permissions('media.write')
  @Post('upload-url')
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    const result = await this.mediaService.generateUploadUrl(dto);
    return { data: result };
  }

  @Permissions('media.write')
  @Post(':id/associate')
  async associate(@Param('id') id: string, @Body() dto: AssociateMediaDto) {
    const result = await this.mediaService.associate(id, dto);
    return { data: result };
  }

  @Permissions('media.write')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.mediaService.softDelete(id);
    return { data: true };
  }
}

