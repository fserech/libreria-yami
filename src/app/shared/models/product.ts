import { DocumentReference } from '@angular/fire/compat/firestore';

export interface Product {
  uid?: string;
  name: string;
  description: string;
  brandsRef: DocumentReference[];
  categoryRef: DocumentReference;
  stock: string;
  unitMeasurement: string;
  priceSale: string;
  package?: PackageInfo;
}

export interface PackageInfo {
  priceTotal: string;
  units: string;
  unitPrice: string;
  cost: string;
}
