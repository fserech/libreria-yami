import { DocumentReference } from '@angular/fire/compat/firestore';

export interface Article {
    uid?: string;
    name: string;
    mark: string;
    categoryRef: DocumentReference;
    keywords: string[];
}
