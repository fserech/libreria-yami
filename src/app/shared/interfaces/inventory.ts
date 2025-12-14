// shared/interfaces/inventory.ts

import { Product } from './product';

/**
 * Interfaz principal para gestión de inventario
 */
export interface Inventory extends Product {
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  categoryId: number;
  brandId: number;
  supplierId: number;
  categoryName?: string;
  brandName?: string;
  supplierName?: string;
  lastRestock: string;
  soldLastMonth: number;
}

/**
 * Estados del inventario
 */
export type InventoryStatus = 'critical' | 'warning' | 'high' | 'normal';

/**
 * KPIs del inventario
 */
export interface InventoryKPIs {
  totalValue: number;
  totalRevenue: number;
  potentialProfit: number;
  totalItems: number;
  lowStockCount: number;
}
