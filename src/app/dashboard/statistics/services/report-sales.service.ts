import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Action, AngularFirestore, DocumentChangeAction, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportSalesService {

  constructor(private firestore: AngularFirestore) {}

  getSalesLastFewMonths(collection: string, initDate: Date, endDate: Date, field: string, type: string): Observable<any[]> {
    const initDateAdjusted = new Date(initDate);
    initDateAdjusted.setHours(0, 0, 0, 0);
    const endDateAdjusted = new Date(endDate);
    endDateAdjusted.setHours(23, 59, 59, 999);

    return this.firestore.collection(collection, ref =>
      ref.where(field, '>=', initDateAdjusted).where(field, '<=', endDateAdjusted).where('type','==', type)
    ).valueChanges();
  }
}
