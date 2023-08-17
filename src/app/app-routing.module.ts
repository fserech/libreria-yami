import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/login.guard';

const routes: Routes = [
  { path: 'auth', canActivate: [ LoginGuard ] ,loadChildren: () => import('./authentication/autentication.module').then( m => m.AutenticationModule) },
  { path: 'dashboard', canActivate: [ AuthGuard ], loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardModule) },
  { path: 'not-found', component: NotFoundComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full'},
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
