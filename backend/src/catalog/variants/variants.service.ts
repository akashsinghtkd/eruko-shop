import { Injectable } from '@nestjs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  async findByProduct(productId: string) {
    return { items: [], total: 0, productId };
  }

  async findOne(id: string) {
    return { id };
  }

  async create(dto: CreateVariantDto) {
    return { id: 'generated-variant-id', ...dto };
  }

  async update(id: string, dto: UpdateVariantDto) {
    return { id, ...dto };
  }

  async softDelete(id: string) {
    return;
  }

  async restore(id: string) {
    return { id };
  }
}

