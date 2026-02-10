import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Permissions('audit_logs.read')
  @Get()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.auditLogsService.list();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('audit_logs.read')
  @Get(':id')
  async getById(@Param('id') id: string) {
    const entry = await this.auditLogsService.getById(id);
    return { data: entry };
  }
}

