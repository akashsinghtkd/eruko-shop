export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoMediaId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  brandId?: string;
  description?: string;
  status?: ProductStatus;
  categoryIds?: string[];
  primaryMediaId?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type VariantStatus = "active" | "inactive";

export interface Variant {
  id: string;
  name: string;
  sku: string;
  productId: string;
  price: number;
  attributesJson?: string;
  status?: VariantStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  variantId: string;
  warehouseId?: string;
  quantity: number;
  [key: string]: unknown;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  linkedType?: string;
  linkedId?: string;
  createdAt?: string;
  url?: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  isActive?: boolean;
  roleIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Review {
  id: string;
  productId?: string;
  userId?: string;
  rating: number;
  title?: string;
  body?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Setting {
  key: string;
  value: string | number | boolean | object;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  payload?: unknown;
  createdAt?: string;
}
