import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private firestore: AngularFirestore) {}

getDocumentReference(collection: string, id: string): DocumentReference {
  return this.firestore.collection(collection).doc(id).ref;
}

getAllItemsCollection(collection: string): Observable<any[]> {
  return this.firestore.collection(collection).snapshotChanges().pipe(
    map(actions => {
      return actions.map((action: DocumentChangeAction<unknown>) => {
        const data = (action.payload.doc.data() as any) || {};
        const uid = action.payload.doc.id;
        return { uid, ...data };
      });
    })
  );
}

getDocumentById(collection: string, uid: string): Observable<any> {
  return this.firestore.collection(collection).doc(uid).get().pipe(
    map((documentSnapshot: DocumentSnapshot<unknown>) => {
      if (documentSnapshot.exists) {
        const documentData = documentSnapshot.data() as any;
        return { uid: documentSnapshot.id, ...documentData };
      }
      return null;
    })
  );
}

async getDocumentByIdToPromise(collection: string, uid: string): Promise<any> {
  try {
    const docRef = firebase.firestore().collection(collection).doc(uid);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      return docSnapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

getDocumentByIdRealTime(collection: string, uid: string){
  return this.firestore.collection(collection).doc(uid).valueChanges({idField: 'uid'});
}

getDataDocumentReference<T>(docRef: DocumentReference<T>): Promise<{}> {
  return docRef.get().then(doc => {
    if (doc.exists) {
      return { uid: doc.id, ...doc.data() };
    } else {
      throw new Error(`El documento no existe!: ${docRef.path}`);
    }
  });
}

saveDocument(collection: string, document: any): Promise<any> {
  // Crea una nueva referencia en la colección y asigna los datos
  return this.firestore.collection(collection).add(document);
}
}
