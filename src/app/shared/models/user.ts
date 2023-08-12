export interface User {
}

export interface UserData {
  userName: string;  // Nombre de usuario
  nickname: string;  // Apodo
  gender: 'M' | 'F'; // Género ('M' para masculino, 'F' para femenino)
  roleRef: string; // Referencia al documento de rol (debe ser un DocumentReference de Firebase)
}
