import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {


constructor(private firestore: AngularFirestore) { }

  getRol(id: string): Observable<any> {
    return this.firestore.collection('roles').doc(id).valueChanges();
  }

}
