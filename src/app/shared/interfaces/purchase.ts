// purchases.interface.ts
export interface Purchase {
  id?: number;
  purchaseDate: string;
  supplierId: number;
  supplierName?: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  observation?: string;
  items: PurchaseItem[];
  idUser?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id?: number;
  productId?: number;
  variantId?: number;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  // Información adicional del producto
  categoryName?: string;
  brandName?: string;
  currentStock?: number;
}

export interface PurchaseProductSelect extends PurchaseItem {
  // Para el selector de productos
  selected?: boolean;
  maxQuantity?: number;
}

export interface PurchaseFilter {
  supplierId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
