import { Product } from "./product";
import { Purchase } from "./purchase";
import { Order } from "./order";

/**
 * Tipos de movimiento de inventario
 */
export enum MovementType {
  PURCHASE = 'PURCHASE',           // Compra a proveedor
  SALE = 'SALE',                   // Venta a cliente
  ADJUSTMENT = 'ADJUSTMENT',       // Ajuste manual
  RETURN_PURCHASE = 'RETURN_PURCHASE', // Devolución a proveedor
  RETURN_SALE = 'RETURN_SALE',     // Devolución de cliente
  TRANSFER = 'TRANSFER',           // Transferencia entre sucursales
  DAMAGE = 'DAMAGE',               // Producto dañado
  LOSS = 'LOSS'                    // Pérdida/robo
}

/**
 * Movimiento de stock individual
 */
export interface StockMovement {
  id?: number;
  productId: number;
  product?: Product;
  variantId?: number | null;
  branchId: number;
  branchName?: string;

  movementType: MovementType;
  quantity: number;              // Positivo = entrada, Negativo = salida
  previousStock: number;
  newStock: number;

  // Referencias opcionales
  purchaseId?: number;
  purchase?: Purchase;
  orderId?: number;
  order?: Order;

  // Información adicional
  userId: number;
  userName?: string;
  reason?: string;               // Para ajustes manuales
  notes?: string;
  unitCost?: number;             // Costo unitario en el momento
  totalValue?: number;           // Valor total del movimiento

  dateCreated: string;
}

/**
 * Stock actual por producto y sucursal
 */
export interface ProductStock {
  id?: number;
  productId: number;
  product?: Product;
  variantId?: number | null;
  branchId: number;
  branchName?: string;

  currentStock: number;
  minStock: number;
  maxStock: number;

  averageCost: number;           // Costo promedio ponderado
  lastCost: number;              // Último costo de compra

  lastRestockDate?: string;
  lastSaleDate?: string;

  // Alertas
  belowMinStock: boolean;
  aboveMaxStock: boolean;
}

/**
 * Para crear ajustes manuales de inventario
 */
export interface StockAdjustment {
  productId: number;
  variantId?: number | null;
  branchId: number;
  quantity: number;              // Cantidad a ajustar (+ o -)
  reason: string;
  notes?: string;
  userId: number;
}

/**
 * Filtros para consultar movimientos
 */
export interface MovementFilter {
  branchId?: number;
  productId?: number;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

/**
 * Resumen de inventario
 */
export interface InventorySummary {
  branchId: number;
  branchName: string;
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  overStockProducts: number;
}
