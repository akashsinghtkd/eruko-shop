import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  async list() {
    return { items: [], total: 0 };
  }

  async getByKey(key: string) {
    return { key, value: null };
  }

  async updateValue(key: string, value: any) {
    return { key, value };
  }
}

