import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Role } from 'src/app/dashboard/users-roles/models/role';

@Injectable({
  providedIn: 'root'
})
export class LocaleFilesJsonService {

  constructor(private http: HttpClient, private firestore: AngularFirestore) { }

  // Método para obtener el archivo super-admin.json
  getAssetFile(fileName: string): Observable<any> {
    const filePath = `/assets/data/${fileName}`;
    return this.http.get(filePath);
  }

  saveDocument(collection: string, document: Role): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(collection).doc(id).set(document);
  }

}
