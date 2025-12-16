// shared/interfaces/inventory.ts
import { Product } from './product';

/**
 * Interfaz principal para gestión de inventario
 */
export interface Inventory {
  id?: number;
  // Identidad
  productName: string;
  productDesc?: string;
  // Precios
  salePrice: number;   // precio de venta
  costPrice: number;   // precio de compra
  // Relaciones
  categoryId?: number;
  categoryName?: string; // Nombre de la categoría para mostrar
  brandRef?: number[];
  brandNames?: string[]; // Nombres de las marcas para mostrar
  supplierId?: number[];
  supplierNames?: string[]; // Nombres de los proveedores para mostrar
  // Stock actual (calculado desde minStock si no existe)
  stock: number;
  // Reglas de stock (solo límites)
  minStock: number;
  maxStock: number;
  // Estado
  active: boolean;
  isSelected?: boolean;
  // Datos adicionales para inventario
  lastRestock?: string;
  soldLastMonth?: number;
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
