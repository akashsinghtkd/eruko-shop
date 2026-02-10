import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  async findAll() {
    return { items: [], total: 0 };
  }

  async findOne(id: string) {
    return { id };
  }

  async create(dto: CreateBrandDto) {
    return { id: 'generated-brand-id', ...dto };
  }

  async update(id: string, dto: UpdateBrandDto) {
    return { id, ...dto };
  }

  async softDelete(id: string) {
    return;
  }

  async restore(id: string) {
    return { id };
  }
}

