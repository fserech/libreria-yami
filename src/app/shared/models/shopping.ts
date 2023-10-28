import { Bill } from "./bill";
import { Supplier } from "./supplier";

export interface Shopping {
 uid?: string;
 createAt: Date;
 status: 'PENDING'| 'PENDING_CHARGE_STOCK' |'FINALIZED';
 description?: string;
 total: string;
 bill: Bill;
//  supplier: Supplier;
 details: DetailsShopping[];
 shoppCanceled?: boolean;
}

export interface DetailsShopping{
  product: ProductShopping;
  quantity: string;
  priceUnit: string;
  subTotal: string;
}

export interface ProductShopping{
  uid: string;
  name: string;
  brand: string;
  category: string;
}


