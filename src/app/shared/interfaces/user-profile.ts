export interface UserProfile {
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  sub: string;
  userId?: number; // ← Agregar esto si viene en el token
}
