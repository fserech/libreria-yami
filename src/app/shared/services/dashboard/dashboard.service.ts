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

getAllItemsCollection(collection: string, fieldOrder: string): Observable<any[]> {
  return this.firestore.collection(collection, ref => ref.orderBy(fieldOrder)).snapshotChanges().pipe(
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

async getDataDocumentReferenceModelAny<T>(docRef: DocumentReference<T>) {
  const doc = await docRef.get();

  if (doc.exists) {
    return { uid: doc.id, ...doc.data() };
  } else {
    throw new Error(`El documento no existe!: ${docRef.path}`);
  }
}

saveDocument(collection: string, document: any): Promise<any> {
  // Crea una nueva referencia en la colección y asigna los datos
  return this.firestore.collection(collection).add(document);
}

// Elimina un documento de una colección por su ID.
DeleteDocument(collection: string, uid: string): Promise<void> {
  return this.firestore.collection(collection).doc(uid).update({ active: false });
}


udpateDocument(uid: string, collection: string, document: any){
  if(document.uid)delete document.uid;
  const collectionRef = this.firestore.collection(collection);
  return collectionRef.doc(uid).set(document, { merge: true });
}

searchByArrayString(collection: string, field: string, searchTerm: string, fieldOrder: string){

  searchTerm.toLowerCase();
  let valueArray: string[] = [];
  (searchTerm !== '') ? valueArray = searchTerm.split(' ') : valueArray = [] ;

  console.log('Array evaluado:', valueArray);
  if(valueArray.length > 0){
    console.log('Entro al Array');
    return this.firestore
    .collection(collection, ref => ref
    .where(field, '>=', valueArray)
    // .where(field, 'array-contains-any', valueArray)
    // .where(field, '<=', valueArray + '\uf8ff')
    )
    .valueChanges({idField: 'uid'});
  }else{
    console.log('No entro al Array');
    return this.firestore
    .collection(collection, ref => ref
    .orderBy(fieldOrder))
    .valueChanges({idField: 'uid'});
  }
}

searchForField(collection: string, field: string, value: string) {
  const valorNormalizado = value.toLowerCase();
  return this.firestore
    .collection(collection, (ref) =>
      ref.where(field, '>=', valorNormalizado)
         .where(field, '<=', valorNormalizado + '\uf8ff')
    )
    .valueChanges({ idField: 'uid' });
}

getDocumentsByDateRange(collection: string, initDate: Date, endDate: Date, field: string): Observable<any[]> {
  const initDateAdjusted = new Date(initDate);
  initDateAdjusted.setHours(0, 0, 0, 0);
  const endDateAdjusted = new Date(endDate);
  endDateAdjusted.setHours(23, 59, 59, 999);

  return this.firestore.collection(collection, ref =>
    ref.where(field, '>=', initDateAdjusted).where(field, '<=', endDateAdjusted)
  ).snapshotChanges().pipe(
    map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as any;
        const uid = action.payload.doc.id;
        return { uid, ...data };
      });
    })
  );
}


getItemsPageNext(collection: string, endDoc: any, limit: number, orderByField: string, directionStr: 'desc' | 'asc'): Observable<any>{

  const query = this.firestore.collection(collection, ref => {

    const orderedQuery = ref.orderBy(orderByField);

    // return orderedQuery.startAfter(endDoc).limit(limit);
    if (directionStr === 'desc') {
      return orderedQuery.startAfter(endDoc).limit(limit);
    } else if (directionStr === 'asc') {
      return orderedQuery.startAt(endDoc).limit(limit);
    } else {
      throw new Error(`Invalid directionStr: ${directionStr}`);
    }
  });

  return query.valueChanges({ idField: 'uid' });
}

getItemsPagePrevious(collection: string, firstDoc:any, limit: number, orderByField: string, directionStr: 'desc' | 'asc'){

  const query = this.firestore.collection(collection, ref => {
    const orderedQuery = ref.orderBy(orderByField);

    if (directionStr === 'desc') {
      return orderedQuery.endBefore(firstDoc).limit(limit);
    } else if (directionStr === 'asc') {
      return orderedQuery.endAt(firstDoc).limit(limit);
    } else {
      throw new Error(`Invalid directionStr: ${directionStr}`);
    }
  });

  return query.valueChanges({ idField: 'uid' });
  // return this.firestore
  //   .collection(collection, ref => ref
  //       .orderBy(orderByField, directionStr)
  //       .startAfter(firstDoc)
  //       .limit(limit))
  //       .valueChanges({ idField: 'uid' });
  // // const db = firebase.firestore().collection(collection);
  // // return db.endBefore(firstDoc).limit(5).get();
}


getItemsPageNextSearch(collection: string, endDoc: any, limit: number, fieldSearch: string, value: string): Observable<any>{

  const valueTemp = value.toLowerCase();
  return this.firestore.collection(collection, (ref) => {

    let query: any = ref;
    // .orderBy(fieldSearch);

    // Limitar el número de resultados
    // query = query.limit(limit);
    // Aplicar la condición de búsqueda en el campo especificado
    // query = (value === '') ? query.where(fieldSearch, '>=', value) : query.where(fieldSearch, '>=', value);
    if(value !== '') {
      console.log('no esta vacio', value);
      query.where(fieldSearch,'>=', valueTemp);
      // .where(fieldSearch, '>=', valueTemp);
    }

    // Comenzar después del documento endDoc (para paginación)
    // if (endDoc) {
    //   query = query.startAfter(endDoc);
    // }
    return query;
  }).valueChanges();
}

getItemsPagePreviousSearch(collection: string, firstDoc:any, limit: number, orderByField: string, directionStr: 'desc' | 'asc', value: string){

  const query = this.firestore.collection(collection, ref => {

    let orderedQuery = (value === '') ? ref.orderBy(orderByField) : ref.orderBy(orderByField).where('name','>=', value);

    if (directionStr === 'desc') {
      return orderedQuery.endBefore(firstDoc).limit(limit);
    } else if (directionStr === 'asc') {
      return orderedQuery.endAt(firstDoc).limit(limit);
    } else {
      throw new Error(`Invalid directionStr: ${directionStr}`);
    }
  });

  return query.valueChanges({ idField: 'uid' });
}

}
