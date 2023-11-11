import { DocumentReference } from "@angular/fire/firestore";
import { Sale } from "./sale";
import { Shopping } from "./shopping";

export interface Inventory {
    uid?: string;
    entryMovements: Movement[];
    exitMovements : Movement[];
    productRef: DocumentReference;
  }
  export interface Movement {
    type: 'entry' | 'exit';
    quantity: number;
    date: Date;
    shopping: Shopping;
    sale: Sale;
  }
  
  
  