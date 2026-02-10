import { Injectable } from '@nestjs/common';

@Injectable()
export class WarehousesService {
  async findAll() {
    return { items: [], total: 0 };
  }

  async findOne(id: string) {
    return { id };
  }

  async create(data: any) {
    return { id: 'generated-warehouse-id', ...data };
  }

  async update(id: string, data: any) {
    return { id, ...data };
  }

  async softDelete(id: string) {
    return;
  }
}

