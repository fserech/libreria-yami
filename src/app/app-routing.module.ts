import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'categories-products',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'sales',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'shopping',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
    {
    path: 'roles-users',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'statistics',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  {
    path: 'cancellations',
    loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  },
  // {
  //   path: 'sales',
  //   loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  // },
  // {
  //   path: 'sales',
  //   loadChildren: () => import('./authetication/authetication.module').then( m => m.AutheticationModule)
  // },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
