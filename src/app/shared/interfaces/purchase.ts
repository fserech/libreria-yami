import { Product } from "./product";
import { Supplier } from "./supplier";

/**
 * Interfaz principal de Compra
 * Similar a Order pero para compras a proveedores
 */
export interface Purchase {
  id?: number;
  supplierId: number;
  supplier?: Supplier; // Opcional, puede venir del backend
  userId: number;
  purchaseDate: string;
  totalAmount?: number; // Calculado automáticamente
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  observation?: string;
  dateCreated?: string;
  products: ProductPurchase[];
}

/**
 * Producto dentro de una compra
 * Equivalente a ProductOrder
 */
export interface ProductPurchase {
  id?: number;
  product?: Product; // Opcional, puede venir del backend con todos los detalles
  productId?: number;
  variantId?: number | null;
  priceCost: number; // Precio de compra (equivalente a priceSale en Order)
  quantity: number;
  subtotal: number;
}

/**
 * Para la selección de productos en el UI
 * Equivalente a ProductOrderSelect
 */
export interface ProductPurchaseSelect {
  id?: number;
  product: Product;
  variantId?: number | null;
  quantity: number;
}

/**
 * Filtros para búsqueda de compras
 */
export interface PurchaseFilter {
  supplierId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
