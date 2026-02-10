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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Permissions('categories.read')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('parentId') _parentId?: string,
  ) {
    const result = await this.categoriesService.findAll();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('categories.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return { data: category };
  }

  @Permissions('categories.write')
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    return { data: category };
  }

  @Permissions('categories.write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, dto);
    return { data: category };
  }

  @Permissions('categories.write')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoriesService.softDelete(id);
    return { data: true };
  }

  @Permissions('categories.write')
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const category = await this.categoriesService.restore(id);
    return { data: category };
  }
}

