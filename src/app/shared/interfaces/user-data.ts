// ==========================================
// 1. INTERFAZ ACTUALIZADA
// ==========================================
export interface User {
    id_user?: number;
    name: string;
    email: string;
    password: string;
    role: 1 | 2 | 'ROLE_ADMIN' | 'ROLE_USER';
    modules: string; // Ahora es "modules" en lugar de "days_sale"
}

// ==========================================
// 2. INTERFAZ PARA MÓDULOS
// ==========================================
export interface Module {
    id: string;
    name: string;
    icon: string;
    description?: string;
}

// ==========================================
// 3. LISTA DE MÓDULOS DEL SISTEMA
// ==========================================
export const SYSTEM_MODULES: Module[] = [
    { id: 'ventas', name: 'Ventas', icon: 'matShoppingCartOutline', description: 'Gestión de ventas' },
    { id: 'compras', name: 'Compras', icon: 'matShoppingBagOutline', description: 'Gestión de compras' },
    { id: 'productos', name: 'Productos', icon: 'matInventory2Outline', description: 'Catálogo de productos' },
    { id: 'inventario', name: 'Inventario', icon: 'matWarehouseOutline', description: 'Control de inventario' },
    { id: 'promociones', name: 'Promociones', icon: 'matLocalOfferOutline', description: 'Ofertas y promociones' },
    { id: 'clientes', name: 'Clientes', icon: 'matGroupOutline', description: 'Gestión de clientes' },
    { id: 'proveedores', name: 'Proveedores', icon: 'matBusinessOutline', description: 'Gestión de proveedores' },
    { id: 'categorias', name: 'Categorías', icon: 'matCategoryOutline', description: 'Categorías de productos' },
    { id: 'sucursales', name: 'Sucursales', icon: 'matStoreOutline', description: 'Gestión de sucursales' },
    { id: 'usuarios', name: 'Roles y usuarios', icon: 'matPeopleOutline', description: 'Administración de usuarios' }
];
