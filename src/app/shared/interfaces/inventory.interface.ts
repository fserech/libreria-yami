// src/app/shared/interfaces/inventory.interface.ts

export interface Inventory {
  id?: number;
  branch: {
    id: number;
    name: string;
  };
  branchId: number;
  product: {
    id: number;
    productName: string;
    sku?: string;
  };
  productId: number;
  variant?: {
    id: number;
    variantName: string;
    sku: string;
  };
  variantId?: number;
  currentStock: number;
  minStock?: number;
  maxStock?: number;
  reservedStock: number;
  availableStock: number;
  costPrice?: number;
  salePrice?: number;
  locationCode?: string;
  warehouseZone?: string;
  dateCreated?: string;
  dateUpdated?: string;
  lastRestockDate?: string;
  lastSaleDate?: string;
  stockStatus?: 'SIN_STOCK' | 'STOCK_BAJO' | 'STOCK_NORMAL' | 'STOCK_ALTO';
}

export interface InventoryMovement {
  id?: number;
  inventory: {
    id: number;
  };
  inventoryId: number;
  branch: {
    id: number;
    name: string;
  };
  branchId: number;
  userId: number;
  movementType: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitCost?: number;
  totalCost?: number;
  referenceId?: number;
  referenceType?: string;
  reason?: string;
  notes?: string;
  movementDate: string;
}

export enum MovementType {
  // Entradas
  PURCHASE = 'PURCHASE',
  PURCHASE_RETURN = 'PURCHASE_RETURN',
  SALE_RETURN = 'SALE_RETURN',
  TRANSFER_IN = 'TRANSFER_IN',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  INITIAL_STOCK = 'INITIAL_STOCK',

  // Salidas
  SALE = 'SALE',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  LOSS = 'LOSS',

  // Especiales
  RESERVATION = 'RESERVATION',
  RELEASE_RESERVATION = 'RELEASE_RESERVATION'
}

export interface InventoryAdjustment {
  inventoryId: number;
  branchId: number;
  productId: number;
  variantId?: number;
  quantity: number;
  movementType: MovementType;
  reason: string;
  notes?: string;
  unitCost?: number;
}

export interface InventoryFilters {
  branchId?: number;
  productId?: number;
  stockStatus?: string;
  minStock?: number;
  maxStock?: number;
}
