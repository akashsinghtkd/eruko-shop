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
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Permissions('variants.read')
  @Get('products/:productId/variants')
  async listByProduct(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.variantsService.findByProduct(productId);
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('variants.read')
  @Get('variants/:id')
  async findOne(@Param('id') id: string) {
    const variant = await this.variantsService.findOne(id);
    return { data: variant };
  }

  @Permissions('variants.write')
  @Post('products/:productId/variants')
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    const variant = await this.variantsService.create({
      ...dto,
      productId,
    });
    return { data: variant };
  }

  @Permissions('variants.write')
  @Patch('variants/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    const variant = await this.variantsService.update(id, dto);
    return { data: variant };
  }

  @Permissions('variants.write')
  @Delete('variants/:id')
  async remove(@Param('id') id: string) {
    await this.variantsService.softDelete(id);
    return { data: true };
  }

  @Permissions('variants.write')
  @Post('variants/:id/restore')
  async restore(@Param('id') id: string) {
    const variant = await this.variantsService.restore(id);
    return { data: variant };
  }
}

