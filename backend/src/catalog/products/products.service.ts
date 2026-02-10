import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  async findAll() {
    return { items: [], total: 0 };
  }

  async findOne(id: string) {
    return { id };
  }

  async create(dto: CreateProductDto) {
    return { id: 'generated-product-id', ...dto };
  }

  async update(id: string, dto: UpdateProductDto) {
    return { id, ...dto };
  }

  async changeStatus(id: string, status: string) {
    return { id, status };
  }

  async softDelete(id: string) {
    return;
  }

  async restore(id: string) {
    return { id };
  }
}

