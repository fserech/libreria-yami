import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Observable, map, combineLatest } from 'rxjs';
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
      const documentData = docSnapshot.data() as any;
      return { uid: docSnapshot.id, ...documentData };
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

// Elimina un documento de una colección por su ID.
DeleteDocument(collection: string, uid: string): Promise<void> {
  return this.firestore.collection(collection).doc(uid).delete();
}

udpateDocument(uid: string, collection: string, document: any){
  if(document.uid)delete document.uid;
  const collectionRef = this.firestore.collection(collection);
  return collectionRef.doc(uid).set(document, { merge: true });
}


findItemsCollection(collection: string, field: string, searchTerm: string){

  // Divide el término de búsqueda en palabras.
  const searchTerms = searchTerm.toLowerCase().split(' ');

  // Crea un arreglo de observables, uno por cada palabra en el término de búsqueda.
  const observables = searchTerms.map(term => {
    return this.firestore.collection(collection, ref => {
      return ref
        .where(field, 'array-contains', term)
        .limit(10);
    }).valueChanges();
  });

  // Combina los resultados de las consultas en un solo arreglo de resultados.
  return combineLatest(observables).pipe(
    map(results => {
      // Concatena todos los resultados en un solo arreglo.
      return [].concat(...results);
    })
  );
}

}
