import { DocumentReference } from '@angular/fire/compat/firestore';

export interface UserFirestore {
  uid?: string,
  email: string,
  userName: string;  // Nombre de usuario
  nickname: string;  // Apodo
  gender: 'M' | 'F'; // Género ('M' para masculino, 'F' para femenino)
  roleRef: DocumentReference; // Referencia al documento de rol (debe ser un DocumentReference de Firebase)
  active: boolean;
}

export interface UserData {
  uid?: string,
  password?: string,
  email: string,
  userName: string;  // Nombre de usuario
  nickname: string;  // Apodo
  gender: 'M' | 'F'; // Género ('M' para masculino, 'F' para femenino)
  active: boolean;
  roleRef: string; // Referencia al documento de rol (debe ser un DocumentReference de Firebase)
}
