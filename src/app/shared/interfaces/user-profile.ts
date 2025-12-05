export interface UserProfile {
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  sub: string;
}
