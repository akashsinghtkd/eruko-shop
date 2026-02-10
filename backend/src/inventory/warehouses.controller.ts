import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Permissions('inventory.read')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.warehousesService.findAll();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('inventory.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const warehouse = await this.warehousesService.findOne(id);
    return { data: warehouse };
  }

  @Permissions('inventory.adjust')
  @Post()
  async create(@Body() body: any) {
    const warehouse = await this.warehousesService.create(body);
    return { data: warehouse };
  }

  @Permissions('inventory.adjust')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const warehouse = await this.warehousesService.update(id, body);
    return { data: warehouse };
  }

  @Permissions('inventory.adjust')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.warehousesService.softDelete(id);
    return { data: true };
  }
}

