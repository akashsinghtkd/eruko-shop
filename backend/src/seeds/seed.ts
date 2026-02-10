import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const supabase = app.get(SupabaseService).getClient();

  console.log('Seeding roles and permissions...');

  const permissions = [
    // Auth
    { name: 'auth.login', module: 'auth', description: 'Login to admin panel' },
    { name: 'auth.me', module: 'auth', description: 'Read own profile' },
    // Users
    { name: 'users.read', module: 'users', description: 'List and view users' },
    { name: 'users.write', module: 'users', description: 'Create and update users' },
    // RBAC
    { name: 'roles.read', module: 'rbac', description: 'List and view roles' },
    { name: 'roles.write', module: 'rbac', description: 'Create and update roles' },
    { name: 'permissions.read', module: 'rbac', description: 'List permissions' },
    // Catalog
    { name: 'brands.read', module: 'catalog', description: 'List and view brands' },
    { name: 'brands.write', module: 'catalog', description: 'Create and update brands' },
    { name: 'categories.read', module: 'catalog', description: 'List and view categories' },
    { name: 'categories.write', module: 'catalog', description: 'Create and update categories' },
    { name: 'products.read', module: 'catalog', description: 'List and view products' },
    { name: 'products.write', module: 'catalog', description: 'Create and update products' },
    { name: 'variants.read', module: 'catalog', description: 'List and view variants' },
    { name: 'variants.write', module: 'catalog', description: 'Create and update variants' },
    // Inventory
    { name: 'inventory.read', module: 'inventory', description: 'View stock levels' },
    { name: 'inventory.adjust', module: 'inventory', description: 'Adjust stock levels' },
    // Media
    { name: 'media.read', module: 'media', description: 'List and view media assets' },
    { name: 'media.write', module: 'media', description: 'Upload and manage media assets' },
    // Reviews
    { name: 'reviews.read', module: 'reviews', description: 'List and view reviews' },
    { name: 'reviews.moderate', module: 'reviews', description: 'Moderate and edit reviews' },
    // Settings
    { name: 'settings.read', module: 'settings', description: 'View system settings' },
    { name: 'settings.manage', module: 'settings', description: 'Update system settings' },
    // Audit logs
    { name: 'audit_logs.read', module: 'audit_logs', description: 'View audit logs' },
  ];

  const { error: permError } = await supabase
    .from('permissions')
    .upsert(permissions, { onConflict: 'name' });

  if (permError) {
    console.error('Failed to upsert permissions', permError);
    process.exit(1);
  }

  const roles = [
    { name: 'super_admin', display_name: 'Super Admin', description: 'Full access to all resources' },
    { name: 'admin', display_name: 'Admin', description: 'Manage catalog, users, and inventory' },
    { name: 'staff', display_name: 'Staff', description: 'Limited access to catalog and inventory' },
  ];

  const { error: roleError } = await supabase
    .from('roles')
    .upsert(roles, { onConflict: 'name' });

  if (roleError) {
    console.error('Failed to upsert roles', roleError);
    process.exit(1);
  }

  const { data: dbRoles, error: dbRolesError } = await supabase
    .from('roles')
    .select('id, name');

  if (dbRolesError || !dbRoles) {
    console.error('Failed to fetch roles', dbRolesError);
    process.exit(1);
  }

  const { data: dbPerms, error: dbPermsError } = await supabase
    .from('permissions')
    .select('id, name');

  if (dbPermsError || !dbPerms) {
    console.error('Failed to fetch permissions', dbPermsError);
    process.exit(1);
  }

  const findPermIds = (names: string[]) =>
    dbPerms.filter((p) => names.includes(p.name)).map((p) => p.id);

  const rolePermissionMap: Record<string, string[]> = {
    super_admin: dbPerms.map((p) => p.name),
    admin: [
      'auth.login',
      'auth.me',
      'users.read',
      'users.write',
      'roles.read',
      'permissions.read',
      'brands.read',
      'brands.write',
      'categories.read',
      'categories.write',
      'products.read',
      'products.write',
      'variants.read',
      'variants.write',
      'inventory.read',
      'inventory.adjust',
      'media.read',
      'media.write',
      'reviews.read',
      'reviews.moderate',
      'settings.read',
      'audit_logs.read',
    ],
    staff: [
      'auth.login',
      'auth.me',
      'brands.read',
      'categories.read',
      'products.read',
      'variants.read',
      'inventory.read',
      'inventory.adjust',
      'media.read',
      'reviews.read',
    ],
  };

  const rolePermissionsRows: { role_id: string; permission_id: string }[] = [];

  for (const role of dbRoles) {
    const permNames = rolePermissionMap[role.name] ?? [];
    const permIds = findPermIds(permNames);
    permIds.forEach((permId) => {
      rolePermissionsRows.push({ role_id: role.id, permission_id: permId });
    });
  }

  if (rolePermissionsRows.length) {
    const { error: rpError } = await supabase
      .from('role_permissions')
      .upsert(rolePermissionsRows, { onConflict: 'role_id,permission_id' as any });

    if (rpError) {
      console.error('Failed to upsert role_permissions', rpError);
      process.exit(1);
    }
  }

  // Seed a super admin auth user and local user record
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  console.log(
    `Seeding super admin auth user with email: ${adminEmail} (password: ${adminPassword})`,
  );

  // Create Supabase Auth user (if not already created)
  const { error: createAuthError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  } as any);

  if (createAuthError) {
    const msg = (createAuthError as any).message || '';
    if (msg.includes('already registered')) {
      console.log('Supabase auth user already exists, skipping create.');
    } else {
      console.error('Failed to create Supabase auth user', createAuthError);
    }
  }

  // Ensure local users table entry exists
  const { data: existingUsers, error: userQueryError } = await supabase
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .limit(1);

  if (userQueryError) {
    console.error('Failed to query users table', userQueryError);
    process.exit(1);
  }

  let userId: string | null = existingUsers && existingUsers.length ? existingUsers[0].id : null;

  if (!userId) {
    const { data: insertedUsers, error: insertUserError } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        full_name: 'Super Admin',
        is_active: true,
      })
      .select()
      .limit(1);

    if (insertUserError || !insertedUsers || !insertedUsers.length) {
      console.error('Failed to insert admin user', insertUserError);
      process.exit(1);
    }

    userId = insertedUsers[0].id;
  }

  const superRole = dbRoles.find((r) => r.name === 'super_admin');
  if (superRole && userId) {
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .upsert(
        [{ user_id: userId, role_id: superRole.id }],
        { onConflict: 'user_id,role_id' as any },
      );

    if (userRoleError) {
      console.error('Failed to upsert user_roles for super admin', userRoleError);
      process.exit(1);
    }
  }

  console.log('Seeding completed.');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});

