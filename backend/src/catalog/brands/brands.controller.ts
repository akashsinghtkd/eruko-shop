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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Permissions('brands.read')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
  ) {
    const result = await this.brandsService.findAll();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('brands.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.findOne(id);
    return { data: brand };
  }

  @Permissions('brands.write')
  @Post()
  async create(@Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.create(dto);
    return { data: brand };
  }

  @Permissions('brands.write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const brand = await this.brandsService.update(id, dto);
    return { data: brand };
  }

  @Permissions('brands.write')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandsService.softDelete(id);
    return { data: true };
  }

  @Permissions('brands.write')
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const brand = await this.brandsService.restore(id);
    return { data: brand };
  }
}

