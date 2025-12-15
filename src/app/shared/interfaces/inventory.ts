// shared/interfaces/inventory.ts

import { Product } from './product';

/**
 * Interfaz principal para gestión de inventario
 */
export interface Inventory extends Product {

  stock: number;
  id?: number;
  // Identidad
  productName: string;
  productDesc?: string;
  // Precios
  salePrice: number;   // precio de venta
  costPrice: number;   // precio de compra
  // Relaciones
  categoryId: number;
  brandRef: number[];
  supplierId: number[];
  // Reglas de stock (solo límites)
  minStock: number;
  maxStock: number;
  // Estado
  active: boolean;
    isSelected: boolean;
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
