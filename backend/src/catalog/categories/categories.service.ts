import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async findAll() {
    return { items: [], total: 0 };
  }

  async findOne(id: string) {
    return { id };
  }

  async create(dto: CreateCategoryDto) {
    return { id: 'generated-category-id', ...dto };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return { id, ...dto };
  }

  async softDelete(id: string) {
    return;
  }

  async restore(id: string) {
    return { id };
  }
}

