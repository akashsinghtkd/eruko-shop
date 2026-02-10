import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const authUser = data.user;

    // Load local user, roles and permissions from Postgres via Supabase
    let localUserId: string | null = null;
    let roleNames: string[] = [];
    let permissionNames: string[] = [];

    try {
      // Find local user by email
      const { data: users } = await client
        .from('users')
        .select('id')
        .eq('email', authUser.email)
        .limit(1);

      if (users && users.length) {
        localUserId = users[0].id;
      }

      // If no local user row exists yet, create one and attach the Supabase auth user id
      if (!localUserId && authUser.email) {
        const { data: inserted } = await client
          .from('users')
          .insert({
            email: authUser.email,
            full_name:
              (authUser.user_metadata as any)?.full_name || authUser.email,
            is_active: true,
            auth_user_id: authUser.id,
          })
          .select('id')
          .limit(1);

        if (inserted && inserted.length) {
          localUserId = inserted[0].id;
        }
      }

      if (localUserId) {
        // Load role ids for the user
        const { data: userRoles } = await client
          .from('user_roles')
          .select('role_id')
          .eq('user_id', localUserId);

        const roleIds = (userRoles || []).map((r: any) => r.role_id);

        if (roleIds.length) {
          // Load role names
          const { data: roles } = await client
            .from('roles')
            .select('id, name')
            .in('id', roleIds);

          roleNames = (roles || []).map((r: any) => r.name);

          // Load permission ids for those roles
          const { data: rolePerms } = await client
            .from('role_permissions')
            .select('permission_id')
            .in('role_id', roleIds);

          const permIds = (rolePerms || []).map((rp: any) => rp.permission_id);

          if (permIds.length) {
            const { data: perms } = await client
              .from('permissions')
              .select('name')
              .in('id', permIds);

            permissionNames = (perms || []).map((p: any) => p.name);
          }
        }
      }

      // Fallback: if no permissions were resolved from RBAC, but this is the seeded
      // admin user, grant all permissions defined in the permissions table.
      if (!permissionNames.length && authUser.email === 'admin@example.com') {
        const { data: allPerms } = await client
          .from('permissions')
          .select('name');
        permissionNames = (allPerms || []).map((p: any) => p.name);
        if (!roleNames.includes('super_admin')) {
          roleNames.push('super_admin');
        }
      }
    } catch {
      // If RBAC lookups fail, continue with empty roles/permissions;
      // route-level guards will still enforce access.
    }

    (request as any).user = {
      id: authUser.id,
      email: authUser.email,
      roles: roleNames,
      permissions: permissionNames,
    };

    return true;
  }
}

