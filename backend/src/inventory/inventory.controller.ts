import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Permissions('inventory.read')
  @Get('inventory')
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.inventoryService.listInventory();
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
  @Get('variants/:variantId/inventory')
  async getByVariant(@Param('variantId') variantId: string) {
    const summary = await this.inventoryService.getByVariant(variantId);
    return { data: summary };
  }

  @Permissions('inventory.adjust')
  @Post('inventory/adjust')
  async adjust(@Body() dto: AdjustInventoryDto) {
    const result = await this.inventoryService.adjust(dto);
    return { data: result };
  }
}

