import { DocumentReference } from "@angular/fire/compat/firestore";


export interface Sale {
    uid?: string; 
    name: string;
    description: string;
    totalPrice: string; 
    date: Date; 
    quantity: number;
    nit: boolean;
    stock: string;
    stockMin: string;
    stockMax: string;
    productRef: DocumentReference;
    unitMeasurement: string;
    typeWholesaleUnitMeasure: string;
    unitsPackage: string;
    priceSale: string;
    active: boolean;
    createAt: Date;
    keywords: string[];
   

  }
  
  
  