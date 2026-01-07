export interface User {
    id_user?: number;
    name: string;
    email: string;
    password: string;
    role: 1 | 2 | 'ROLE_ADMIN'|'ROLE_USER';
    days_sale: string;
}

