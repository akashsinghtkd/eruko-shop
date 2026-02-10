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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Permissions('products.read')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') _q?: string,
  ) {
    const result = await this.productsService.findAll();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('products.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return { data: product };
  }

  @Permissions('products.write')
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    return { data: product };
  }

  @Permissions('products.write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    return { data: product };
  }

  @Permissions('products.write')
  @Post(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const product = await this.productsService.changeStatus(id, body.status);
    return { data: product };
  }

  @Permissions('products.write')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.softDelete(id);
    return { data: true };
  }

  @Permissions('products.write')
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const product = await this.productsService.restore(id);
    return { data: product };
  }
}

