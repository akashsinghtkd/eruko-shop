import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RbacService {
  // TODO: implement with Supabase/Postgres

  async listRoles() {
    return { items: [], total: 0 };
  }

  async getRole(id: string) {
    return { id };
  }

  async createRole(dto: CreateRoleDto) {
    return { id: 'generated-role-id', ...dto };
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    return { id, ...dto };
  }

  async deleteRole(id: string) {
    return;
  }

  async listPermissions() {
    return [];
  }

  async getRolePermissions(roleId: string) {
    return [];
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    return { roleId, permissionIds: dto.permissionIds };
  }
}

