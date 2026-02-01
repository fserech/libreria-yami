// ==================== product.ts ====================

export interface ProductSupplierPrice {
  supplierId: number;
  supplierName?: string;
  costPrice: number;
  isPreferred?: boolean;
  lastPurchaseDate?: string;
  lastPurchasePrice?: number;
}

export interface Product {
  id?: number | null;
  productName: string;
  baseProductName?: string;
  productDesc?: string;
  categoryId: number;
  brandRef: number;
  hasVariants: boolean;

  // Relación con sucursal
  branchId?: number | null;
  branch?: {
    id: number;
    name: string;
  };

  // Campos para PRODUCTO SIMPLE (solo si hasVariants = false)
  sku?: string;

  // ⭐ MANTENER COMPATIBILIDAD: costPrice y supplierId siguen existiendo
  costPrice?: number;
  supplierId?: number[];

  // ⭐ NUEVO: Precios por proveedor (opcional, para nuevos productos)
  supplierPrices?: ProductSupplierPrice[];
  desiredMargin?: number;

  // 🆕 NUEVO: Costo promedio ponderado (calculado automáticamente)
  averageCostPrice?: number;

  salePrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;

  // Variantes
  variants?: ProductVariant[];

  // Estado
  active: boolean;
  isSelected?: boolean;

  // Auditoría
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id?: number | null;
  productId?: number;
  sku: string;
  variantName: string;

  // ⭐ MANTENER COMPATIBILIDAD: costPrice y supplierId siguen existiendo
  costPrice: number;
  supplierId: number[];

  // ⭐ NUEVO: Precios por proveedor (opcional, para nuevas variantes)
  supplierPrices?: ProductSupplierPrice[];
  desiredMargin?: number;

  // 🆕 NUEVO: Costo promedio ponderado (calculado automáticamente)
  averageCostPrice?: number;

  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;

  // Atributos dinámicos
  attributes: { [key: string]: string };

  // Estado
  active: boolean;

  // Auditoría
  createdAt?: string;
  updatedAt?: string;
}

export interface VariantAttribute {
  id?: number;
  categoryId: number;
  attributeName: string;
  attributeValues: string[];
  displayOrder?: number;
  required: boolean;
  active?: boolean;
}

export interface Supplier {
  id: number;
  supplierName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface Brand {
  id: number;
  brandName: string;
  active: boolean;
}

export interface Category {
  id: number;
  categoryName: string;
  active: boolean;
}

// ==================== INVENTORY VIEW ====================
export interface ProductInventory {
  productId: number;
  variantId?: number;
  sku: string;
  name: string;
  description: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockStatus: 'LOW_STOCK' | 'NORMAL';
  active: boolean;
  productType: 'SIMPLE' | 'VARIANT';
}

