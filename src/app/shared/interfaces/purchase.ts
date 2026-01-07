import { Product } from "./product";
import { Supplier } from "./supplier";

/**
 * Interfaz principal de Compra
 */
export interface Purchase {
  id?: number;
  supplierId: number;
  supplier?: Supplier;
  userId: number;
  user?: string;
  emailUser?: string;
  idBranch: number;
  branchName?: string;
  purchaseDate: string;
  deliveryDate: string;           // ✅ Fecha de entrega
  totalAmount?: number;
  status?: string;
  observation?: string;
  dateCreated?: string;
  products: ProductPurchase[];
}

export interface ProductPurchase {
  id?: number;
  product?: Product;
  productId?: number;
  variantId?: number | null;
  priceCost: number;
  quantity: number;
  subtotal: number;
}

export interface ProductPurchaseSelect {
  id?: number;
  product: Product;
  variantId?: number | null;
  quantity: number;
}
