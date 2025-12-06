import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { noAuthGuard } from './shared/guards/no-auth.guard';
import { pendingChangesGuard } from './shared/guards/pending-changes.guard';
import { pendingChangesReportsGuard } from './shared/guards/pending-changes-reports.guard';
import { pendingChangesReceiptsGuard } from './shared/guards/pending-changes-receipts.guard';

export const routes: Routes =
[
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
    canMatch: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        title: 'LibreriaYami',
        canMatch: [authGuard],
        loadComponent: () => import('./dashboard/pages/home/home.component')
      },
      {
        path: 'profile',
        title: 'Mi Perfil',
        canMatch: [authGuard],
        loadComponent: () => import('./dashboard/pages/my-profile/my-profile.component')
      },
      {
        path: 'clients',
        title: 'Clientes',
        // loadComponent: () => import('./dashboard/pages/clients/clients.component'),
        canMatch: [authGuard],
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Clientes',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/clients/clients-grid-main/clients-grid-main.component'),
          },
          {
            path: 'detail/:mode',
            title: 'Clientes',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/clients/clients-form/clients-form.component'),
          },
          {
            path: 'detail/:mode/:id',
            title: 'Clientes',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/clients/clients-form/clients-form.component'),
          }
        ]
      },
      {
  path: 'inventory',
  title: 'Inventario',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Inventario',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/inventory/inventory.component')
        .then(m => m.InventoryComponent),
    },
    {
      path: 'movements',
      title: 'Movimientos de Inventario',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/inventory/stock-movements/stock-movements.component')
        .then(m => m.StockMovementsComponent)
    },
    {
      path: 'low-stock',
      title: 'Productos con Bajo Stock',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/inventory/low-stock-alerts/low-stock-alerts.component')
        .then(m => m.LowStockAlertsComponent)
    },
    {
      path: 'entries-exits',
      title: 'Entradas y Salidas',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/inventory/stock-entry-exit/stock-entry-exit.component')
        .then(m => m.StockEntryExitComponent)
    }
  ]
},
{
  path: 'suppliers',
  title: 'Proveedores',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Lista de Proveedores',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/suppliers/suppliers.component')
      .then(m => m.SuppliersComponent),
    },
    {
      path: 'detail/:mode',
      title: 'Proveedor',
      canMatch: [authGuard],
      canDeactivate: [pendingChangesGuard],
      loadComponent: () =>
        import('./dashboard/pages/suppliers/supplier-form/supplier-form.component')
      .then(m => m.SupplierFormComponent),
    }
  ]
},

{
  path: 'purchases',
  title: 'Compras',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Listado de Compras',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/purchases/purchase-list/purchase-list.component')
      .then(m => m.PurchaseListComponent),
    },
    {
      path: 'detail/:mode',
      title: 'Nueva Compra',
      canMatch: [authGuard],
      canDeactivate: [pendingChangesGuard],
      loadComponent: () =>
        import('./dashboard/pages/purchases/purchase-form/purchase-form.component')
      .then(m => m.PurchaseFormComponent),
    },
    {
      path: 'detail/:mode/:id',
      title: 'Editar Compra',
      canMatch: [authGuard],
      canDeactivate: [pendingChangesGuard],
      loadComponent: () =>
        import('./dashboard/pages/purchases/purchase-form/purchase-form.component')
      .then(m => m.PurchaseFormComponent),
    },
    {
      path: 'report',
      title: 'Reporte de Compras',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/purchases/purchase-report/purchase-report.component')
      .then(m => m.PurchaseReportComponent),
    }
  ]
},
{
  path: 'categories',
  title: 'Categorías y Marcas',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Categorías',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/categories/categories.component')
      .then(m => m.CategoriesComponent),
    },
    {
      path: 'category-list',
      title: 'Lista de Categorías',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/categories/category-list/category-list.component')
      .then(m => m.CategoryListComponent),
    },
    {
      path: 'brand-list',
      title: 'Lista de Marcas',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/categories/brand-list/brand-list.component')
      .then(m => m.BrandListComponent),
    }
  ]
},

{
  path: 'promotions',
  title: 'Promociones',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Promociones',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/promotions/promotions.component')
      .then(m => m.PromotionsComponent),
    },
    {
      path: 'new',
      title: 'Nueva Promoción',
      canMatch: [authGuard],
      canDeactivate: [pendingChangesGuard],
      loadComponent: () =>
        import('./dashboard/pages/promotions/discount-form/discount-form.component')
      .then(m => m.DiscountFormComponent),
    },
    {
      path: 'list',
      title: 'Listado de Promociones',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/promotions/discount-list/discount-list.component')
      .then(m => m.DiscountListComponent),
    }
  ]
},
{
  path: 'branches',
  title: 'Sucursales',
  canMatch: [authGuard],
  children: [
    {
      path: '',
      title: 'Sucursales',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/branches/branches.component')
      .then(m => m.BranchesComponent),
    },
    {
      path: 'stock',
      title: 'Stock por Sucursal',
      canMatch: [authGuard],
      loadComponent: () =>
        import('./dashboard/pages/branches/branch-stock/branch-stock.component')
      .then(m => m.BranchStockComponent),
    }
  ]
},


      {
        path: 'orders',
        title: 'Pedidos',
        // loadComponent: () => import('./dashboard/pages/orders/orders.component'),
        canMatch: [authGuard],
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Pedidos',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/orders/orders-grid-main/orders-grid-main.component'),
          },
          {
            path: 'view/:id',
            title: 'Pedidos',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/orders/components/orders-view/orders-view.component'),
          },
          {
            path: 'detail/:mode',
            title: 'Pedidos',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/orders/orders-form/orders-form.component'),
          },
          {
            path: 'detail/:mode/:id',
            title: 'Pedidos',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/orders/orders-form/orders-form.component'),
          }
        ]
      },
      {
        path: 'products',
        title: 'Productos',
        // loadComponent: () => import('./dashboard/pages/products/products.component'),
        canMatch: [authGuard],
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Productos',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/products/products-grid-main/products-grid-main.component'),
          },
          {
            path: 'detail/:mode',
            title: 'Productos',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/products/products-form/products-form.component'),
          },
          {
            path: 'detail/:mode/:id',
            title: 'Productos',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/products/products-form/products-form.component'),
          }
        ]
      },
      {
        path: 'reports',
        title: 'Reportes',
        // loadComponent: () => import('./dashboard/pages/reports/reports.component'),
        canMatch: [authGuard],
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Reportes',
            loadComponent: () => import('./dashboard/pages/reports/reports-grid-main/reports-grid-main.component'),
            canMatch: [authGuard],
            canDeactivate: [pendingChangesReportsGuard],
          },
          {
            path: 'detail/:mode',
            title: 'Reportes',
            loadComponent: () => import('./dashboard/pages/reports/reports-form/reports-form.component'),
            canMatch: [authGuard],
          },
          {
            path: 'detail/:mode/:id',
            title: 'Reportes',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/reports/reports-form/reports-form.component'),
          }
        ]
      },
      {
        path: 'receipts',
        title: 'Recibos',
        canMatch: [authGuard],
        // loadComponent: () => import('./dashboard/pages/reports/reports.component'),
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Recibos',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesReceiptsGuard],
            loadComponent: () => import('./dashboard/pages/receipts/receipts-grid-main/receipts-grid-main.component'),
          },
          {
            path: 'detail/:mode',
            title: 'Recibos',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/reports/reports-form/reports-form.component'),
          },
          {
            path: 'detail/:mode/:id',
            title: 'Recibos',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/reports/reports-form/reports-form.component'),
          }
        ]
      },
      {
        path: 'users',
        title: 'Usuarios y Roles',
        canMatch: [authGuard],
        // loadComponent: () => import('./dashboard/pages/users/users.component'),
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: '',
            title: 'Usuarios y Roles',
            canMatch: [authGuard],
            loadComponent: () => import('./dashboard/pages/users/users-grid-main/users-grid-main.component'),
          },
          {
            path: 'detail/:mode',
            title: 'Usuarios y Roles',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/users/users-form/users-form.component'),
          },
          {
            path: 'detail/:mode/:id',
            title: 'Usuarios y Roles',
            canMatch: [authGuard],
            canDeactivate: [pendingChangesGuard],
            loadComponent: () => import('./dashboard/pages/users/users-form/users-form.component'),
          }
        ]
      }
    ]
  },
  {
    path: 'authentication',
    title: 'Autenticación',
    loadComponent: () => import('./auth/auth.component'),
    children:[
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        title: 'Iniciar Sesión',
        canActivate:[noAuthGuard],
        loadComponent: () => import('./auth/login/login.component')
      },
      {
        path: 'forget-password',
        title: 'Olvide mi contraseña',
        loadComponent: () => import('./auth/forget-password/forget-password.component')
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
];
