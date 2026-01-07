import { Product } from "./product";

export interface Order {
  id?: number;
  clientId: number;
  userId: number;
  user: string;
  emailUser: string;
  idBranch: number;              // ✅ NUEVO: Obligatorio
  branchName?: string;            // ✅ NUEVO: Para mostrar
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
  priceSale: number;
  quantity: number;
  subtotal: number;
}

export interface ProductOrderSelect {
  id?: number;
  product: Product;
  quantity: number;
}
