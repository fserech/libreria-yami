import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
{
  path: '',
  component: DashboardComponent,
  children:[
    {
      path: '',
      loadChildren: () => import('./home/home.module').then( m => m.HomeModule)
    },
    {
      path: 'articles',
      loadChildren: () => import('./articles/articles.module').then( m => m.ArticlesModule)
    },
    {
      path: 'cancellations',
      loadChildren: () => import('./cancellations/cancellations.module').then( m => m.CancellationsModule)
    },
    {
      path: 'categories',
      loadChildren: () => import('./categories/categories.module').then( m => m.CategoriesModule)
    },
    {
      path: 'home',
      loadChildren: () => import('./home/home.module').then( m => m.HomeModule)
    },
    {
      path: 'inventory',
      loadChildren: () => import('./inventory/inventory.module').then( m => m.InventoryModule)
    },
    {
      path: 'products',
      loadChildren: () => import('./products/products.module').then( m => m.ProductsModule)
    },
    {
      path: 'sales',
      loadChildren: () => import('./sales/sales.module').then( m => m.SalesModule)
    },
    {
      path: 'settings',
      loadChildren: () => import('./settings-user/settings-user.module').then( m => m.SettingsUserModule)
    },
    {
      path: 'shopping',
      loadChildren: () => import('./shopping/shopping.module').then( m => m.ShoppingModule)
    },
    {
      path: 'statistics',
      loadChildren: () => import('./statistics/statistics.module').then( m => m.StatisticsModule)
    },
    {
      path: 'users-roles',
      loadChildren: () => import('./users-roles/users-roles.module').then( m => m.UsersRolesModule)
    },
    {
      path: '',
      redirectTo: 'dashboard/home',
      pathMatch: 'full'
    }
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
