import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogsService {
  async list() {
    return { items: [], total: 0 };
  }

  async getById(id: string) {
    return { id };
  }

  async record(data: {
    actorUserId: string;
    action: string;
    module: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
  }) {
    return { id: 'generated-audit-id', ...data };
  }
}

