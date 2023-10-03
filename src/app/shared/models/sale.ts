import { DocumentReference } from "@angular/fire/compat/firestore";

export interface Sale {
    uid?: string;
    nit: string;
    createAt: Date;
    description?: string;
    total: string;
    status: 'UNBILLED' | 'INVOICED';
    products: ProcutSale[];
  }

export interface ProcutSale {
  name: string;
  price: string;
  quantity: string;
  unitMeasurement: string;

}


