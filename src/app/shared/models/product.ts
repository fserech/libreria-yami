import { DocumentReference } from '@angular/fire/compat/firestore';
import { Category } from './category';

export interface Product {
  uid?: string;
  name: string;
  description: string;
  brandsRef: string[];
  categoryRef: DocumentReference;
  stock: string;
  stockMin: string;
  stockMax: string;
  unitMeasurement: string;
  typeWholesaleUnitMeasure: string;
  unitsPackage: string;
  priceSale: string;
  active: boolean;
  createAt: Date;
}
