// ==================== INTERFACES DE PRODUCTO ====================

export interface Product {
  id?: number | null;
  productName: string;
  productDesc: string;
  categoryId: number;
  brandRef: number;

  // Tipo de producto
  hasVariants: boolean; // false = simple, true = con variantes

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

// ==================== DTOs PARA API ====================

export interface ProductCreateDTO {
  productName: string;
  productDesc: string;
  categoryId: number;
  brandRef: number;
  hasVariants: boolean;

  // Producto Simple
  sku?: string;
  costPrice?: number;
  salePrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  supplierId?: number[];

  // Producto con Variantes
  variants?: ProductVariantCreateDTO[];

  active: boolean;
}

export interface ProductVariantCreateDTO {
  sku: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  attributes: { [key: string]: string };
  supplierId: number[];
  active: boolean;
}

export interface ProductUpdateDTO extends ProductCreateDTO {
  id: number;
}

// ==================== RESPONSES ====================

export interface ProductResponse {
  id: number;
  productName: string;
  productDesc: string;
  category: {
    id: number;
    categoryName: string;
  };
  brand: {
    id: number;
    brandName: string;
  };
  hasVariants: boolean;

  // Producto Simple
  sku?: string;
  costPrice?: number;
  salePrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  suppliers?: Supplier[];

  // Producto con Variantes
  variants?: ProductVariantResponse[];

  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantResponse {
  id: number;
  productId: number;
  sku: string;
  variantName: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  attributes: { [key: string]: string };
  suppliers: Supplier[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
