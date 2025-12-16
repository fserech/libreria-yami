export interface Product {
  id?: number;
  // Identidad
  productName: string;
  productDesc?: string;
  // Precios
  salePrice: number;   // precio de venta
  costPrice?: number;   // precio de compra
  // Relaciones
  categoryId?: number;
  brandRef?: number;
  supplierId?: number[];
  // Reglas de stock (solo límites)
  minStock?: number;
  maxStock?: number;
  // Estado
  active: boolean;
    isSelected: boolean;
}
