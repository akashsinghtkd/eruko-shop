import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Permissions('roles.read')
  @Get('roles')
  async listRoles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.rbacService.listRoles();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('roles.read')
  @Get('roles/:id')
  async getRole(@Param('id') id: string) {
    const role = await this.rbacService.getRole(id);
    return { data: role };
  }

  @Permissions('roles.write')
  @Post('roles')
  async createRole(@Body() dto: CreateRoleDto) {
    const role = await this.rbacService.createRole(dto);
    return { data: role };
  }

  @Permissions('roles.write')
  @Patch('roles/:id')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.rbacService.updateRole(id, dto);
    return { data: role };
  }

  @Permissions('roles.write')
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
    return { data: true };
  }

  @Permissions('permissions.read')
  @Get('permissions')
  async listPermissions() {
    const permissions = await this.rbacService.listPermissions();
    return { data: permissions };
  }

  @Permissions('roles.read')
  @Get('roles/:id/permissions')
  async getRolePermissions(@Param('id') id: string) {
    const permissions = await this.rbacService.getRolePermissions(id);
    return { data: permissions };
  }

  @Permissions('roles.write')
  @Put('roles/:id/permissions')
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    const result = await this.rbacService.updateRolePermissions(id, dto);
    return { data: result };
  }
}

