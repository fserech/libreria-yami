// ==================== order.ts ====================

import { Product } from "./product";

export interface Order {
  id?: number;
  clientId: number;
  userId: number;
  user: string;
  emailUser: string;
  idBranch: number;
  branchName?: string;
  description: string;
  status?: string;
  dateCreated?: string;
  totalAmount?: number;
  products: ProductOrder[];
}

export interface ProductOrder {
  id?: number;
  product?: Product;
  productId?: number;
  variantId?: number | null;
  priceSale: number;
  quantity: number;
  subtotal: number;

  // 🆕 NUEVO: Costo promedio congelado al momento de la venta
  costPriceAtSale?: number;
}

export interface ProductOrderSelect {
  id?: number;
  product: Product;
  variantId?: number | null;
  quantity: number;

  // 🆕 NUEVO: Costo promedio congelado al momento de agregar a la orden
  costPriceAtSale?: number;
}
