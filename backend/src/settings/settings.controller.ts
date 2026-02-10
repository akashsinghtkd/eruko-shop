import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Permissions('settings.read')
  @Get()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.settingsService.list();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('settings.read')
  @Get(':key')
  async getByKey(@Param('key') key: string) {
    const setting = await this.settingsService.getByKey(key);
    return { data: setting };
  }

  @Permissions('settings.manage')
  @Put(':key')
  async update(@Param('key') key: string, @Body('value') value: any) {
    const setting = await this.settingsService.updateValue(key, value);
    return { data: setting };
  }
}

