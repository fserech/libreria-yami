import { DocumentReference } from '@angular/fire/compat/firestore';

export interface Brand {
  uid?: string;
  name: string;
  description: string;
  articleRef: DocumentReference; // Cambia el tipo de dato a DocumentReference
  keywords: string[];
}