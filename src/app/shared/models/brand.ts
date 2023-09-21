import { DocumentReference } from '@angular/fire/compat/firestore';



export interface Brand {
  
  uid?: string;
  name: string;
  description: string;
  categoryRef: DocumentReference;
  

}