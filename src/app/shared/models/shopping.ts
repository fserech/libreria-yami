import { Bill } from "./bill";
import { Supplier } from "./supplier";

export interface Shopping {
 uid?: string;
 createAt: Date;
 status: 'PENDING'| 'PENDING_CHARGE_STOCK' |'FINALIZED';
 description?: string;
 total: string;
 products: DetailsShopping[];
 bill: Bill;
 shoppCanceled?: boolean;
}

export interface DetailsShopping{
  productUid: string;
  productName: string;
  productBrand: string;
  productCategory: string;
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


