import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private firestore: AngularFirestore) {}

  getAllRoles(): Observable<any[]> {
    return this.firestore.collection('roles').valueChanges();
  }

}
