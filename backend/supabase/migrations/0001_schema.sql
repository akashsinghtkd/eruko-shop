-- Core RBAC tables
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  module text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists role_permissions (
  role_id uuid not null references roles(id),
  permission_id uuid not null references permissions(id),
  primary key (role_id, permission_id)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text,
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists user_roles (
  user_id uuid not null references users(id),
  role_id uuid not null references roles(id),
  primary key (user_id, role_id)
);

-- Catalog: brands, categories, products, variants
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_media_id uuid,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id),
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  brand_id uuid references brands(id),
  description text,
  status text not null default 'draft',
  primary_media_id uuid,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists product_categories (
  product_id uuid not null references products(id),
  category_id uuid not null references categories(id),
  primary key (product_id, category_id)
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  name text not null,
  sku text not null unique,
  attributes jsonb,
  price numeric(12,2) not null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Inventory
create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id),
  warehouse_id uuid references warehouses(id),
  stock_on_hand int not null default 0,
  stock_reserved int not null default 0,
  is_tracked boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (variant_id, warehouse_id)
);

create table if not exists inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references inventory_items(id),
  change int not null,
  reason text not null,
  note text,
  actor_user_id uuid references users(id),
  created_at timestamptz default now()
);

-- Media
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  mime_type text not null,
  size bigint not null,
  created_by uuid references users(id),
  linked_type text,
  linked_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  user_id uuid references users(id),
  author_name text not null,
  rating int not null,
  title text,
  body text not null,
  status text not null default 'pending',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb,
  description text,
  "group" text,
  is_editable boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  action text not null,
  module text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz default now()
);

