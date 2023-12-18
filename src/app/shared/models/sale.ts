import { DocumentReference } from "@angular/fire/compat/firestore";

export interface Sale {
    uid?: string;
    nit: string;
    createAt: Date;
    description?: string;
    total: string;
    status: 'UNBILLED' | 'INVOICED';
    products: ProductSale[];
    saleCanceled?: boolean;
    cancellationRef?: DocumentReference;
  }

export interface ProductSale {
  uid?: string;
  name: string;
  priceSale: string;
  units: string;
  unitMeasurement?: string;
  date?: Date;
  productBrand?: string;
  subTotal?: string;
}



