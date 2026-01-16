import { MenuItem } from "../interfaces/menu.model";

export const titleManagement: string = 'Gestor';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Dashboard',
      separator: true,
      items: [
        { icon: 'matHomeOutline', label: 'Inicio', route: '/dashboard/home' },
        { icon: 'matGroupOutline', label: 'Roles y usuarios', route: '/dashboard/users' },
        { icon: 'matGroupsOutline', label: 'Clientes', route: '/dashboard/clients' },
        { icon: 'matLoyaltyOutline', label: 'Productos', route: '/dashboard/products' },
        { icon: 'matShoppingBagOutline', label: 'Ventas', route: '/dashboard/orders' },
       // { icon: 'matInsertDriveFileOutline', label: 'Reportes', route: '/dashboard/reports' },
       // { icon: 'matReceiptOutline', label: 'Recibos', route: '/dashboard/receipts' },
        { icon: 'matInventory2Outline', label: 'Inventario', route: '/dashboard/inventory' },
        { icon: 'matProductionQuantityLimitsOutline', label: 'Proveedores', route: '/dashboard/suppliers' },
        { icon: 'matAddShoppingCartOutline', label: 'Compras', route: '/dashboard/purchases' },
        { icon: 'matCategoryOutline', label: 'Categorías', route: '/dashboard/categories' },
        { icon: 'matAnimationOutline', label: 'Promociones', route: '/dashboard/promotions' },
        { icon: 'matAltRouteOutline', label: 'Sucursales', route: '/dashboard/branches' },
      ]
    },
    // {
    //   group: 'Vendedores',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'matTodayOutline',
    //       label: 'Dias asignados',
    //       route: '/dashboard',
    //       children: [
    //         { label: 'Lunes', route: '/dashboard/nfts' },
    //         { label: 'Martes', route: '/dashboard/podcast' },
    //         { label: 'Miercoles', route: '/dashboard/podcast' },
    //         { label: 'Jueves', route: '/dashboard/podcast' },
    //         { label: 'Viernes', route: '/dashboard/podcast' },
    //         { label: 'Sabado', route: '/dashboard/podcast' },
    //       ],
    //     }
    //   ]
    // },
    // {
    //   group: 'Clientes',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'matGroupsOutline',
    //       label: titleManagement,
    //       route: '/dashboard',
    //       children: [
    //         { label: 'Nuevo cliente', route: '/dashboard/nfts' },
    //         { label: 'Ver clientes', route: '/dashboard/podcast' },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   group: 'Productos',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'matLoyaltyOutline',
    //       label: titleManagement,
    //       route: '/dashboard',
    //       children: [
    //         { label: 'Nuevo productos', route: '/dashboard/nfts' },
    //         { label: 'Ver productos', route: '/dashboard/podcast' },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   group: 'Roles y usuarios',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'matGroupOutline',
    //       label: titleManagement,
    //       route: '/dashboard',
    //       children: [
    //         { label: 'Nuevo usuario', route: '/dashboard/nfts' },
    //         { label: 'Ver usuarios', route: '/dashboard/podcast' },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   group: 'Reportería',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'matInsertDriveFileOutline',
    //       label: 'Reportes de Venta',
    //       route: '/dashboard',
    //       children: [
    //         { label: 'Por productos', route: '/dashboard/nfts' },
    //         { label: 'por vendedor', route: '/dashboard/podcast' },
    //       ],
    //     },
    //     {
    //       icon: 'matReceiptOutline',
    //       label: 'Recibos de clientes',
    //       route: '/dashboard',
    //       // children: [
    //       //   { label: '', route: '/dashboard/nfts' },
    //       //   { label: 'Ver usuarios', route: '/dashboard/podcast' },
    //       // ],
    //     },
    //   ],
    // },
    // {
    //   group: 'Collaboration',
    //   separator: true,
    //   items: [
    //     {
    //       icon: 'assets/icons/heroicons/outline/download.svg',
    //       label: 'Download',
    //       route: '/download',
    //     },
    //     {
    //       icon: 'assets/icons/heroicons/outline/gift.svg',
    //       label: 'Gift Card',
    //       route: '/gift',
    //     },
    //     {
    //       icon: 'assets/icons/heroicons/outline/users.svg',
    //       label: 'Users',
    //       route: '/users',
    //     },
    //   ],
    // },
    // {
    //   group: 'Config',
    //   separator: false,
    //   items: [
    //     {
    //       icon: 'assets/icons/heroicons/outline/cog.svg',
    //       label: 'Settings',
    //       route: '/settings',
    //     },
    //     {
    //       icon: 'assets/icons/heroicons/outline/bell.svg',
    //       label: 'Notifications',
    //       route: '/gift',
    //     },
    //     {
    //       icon: 'assets/icons/heroicons/outline/folder.svg',
    //       label: 'Folders',
    //       route: '/folders',
    //       children: [
    //         { label: 'Current Files', route: '/folders/current-files' },
    //         { label: 'Downloads', route: '/folders/download' },
    //         { label: 'Trash', route: '/folders/trash' },
    //       ],
    //     },
    //   ],
    // },
  ];
}




// {
//   icon: 'assets/icons/heroicons/outline/chart-pie.svg',
//   label: 'Productos',
//   route: '/dashboard',
//   children: [
//     { label: 'Nuevo producto', route: '/dashboard/nfts' },
//     { label: 'Ver productos', route: '/dashboard/podcast' },
//   ],
// },
// {
//   icon: 'assets/icons/heroicons/outline/chart-pie.svg',
//   label: 'Roles y usuarios',
//   route: '/dashboard',
//   children: [
//     { label: titleManagement, route: '/dashboard/nfts' },
//     // { label: 'Ver productos', route: '/dashboard/podcast' },
//   ],
// },
// {
//   icon: 'assets/icons/heroicons/outline/chart-pie.svg',
//   label: 'Reportes',
//   route: '/dashboard',
//   children: [
//     { label: 'Manifiestos de ventas', route: '/dashboard/nfts' },
//     { label: 'Reportes de pedidos', route: '/dashboard/podcast' },
//   ],
// },
