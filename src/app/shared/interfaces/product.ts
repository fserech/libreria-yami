// ==================== INTERFACES DE PRODUCTO ====================

export interface Product {
  id?: number | null;
  productName: string;
  productDesc?: string;
  categoryId: number;
  brandRef: number;
  hasVariants: boolean;

   // Relación con sucursal
  branchId?: number | null; // NULL = disponible en todas las sucursales
  branch?: {
    id: number;
    name: string;
  };
  // Campos para PRODUCTO SIMPLE (solo si hasVariants = false)
  sku?: string;
  costPrice?: number;
  salePrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  supplierId?: number[]; // Proveedores del producto simple

  // Variantes (solo si hasVariants = true)
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

  // Precios y Stock
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;

  // Atributos dinámicos
  attributes: { [key: string]: string };
  // Ejemplo: { "hojas": "100", "rayado": "Cuadriculado", "tamaño": "Carta", "color": "Azul" }

  // Proveedores
  supplierId: number[];

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
