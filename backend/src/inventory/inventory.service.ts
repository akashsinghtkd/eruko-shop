import { Injectable } from '@nestjs/common';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  async listInventory() {
    return { items: [], total: 0 };
  }

  async getByVariant(variantId: string) {
    return { variantId, items: [] };
  }

  async adjust(dto: AdjustInventoryDto) {
    return {
      variantId: dto.variantId,
      warehouseId: dto.warehouseId ?? null,
      stockOnHand: 0,
      stockReserved: 0,
      change: dto.change,
      reason: dto.reason,
    };
  }
}

