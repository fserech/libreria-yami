import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewRolComponent } from './components/new-rol/new-rol.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { ViewRolesComponent } from './components/view-roles/view-roles.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';
import { RolesResolver } from './resolvers/roles.resolver';

const routes: Routes = [
  {path: '',component: NewRolComponent },
  {path: 'new-rol',component: NewRolComponent },
  {path: 'new-user',component: NewUserComponent, resolve: { roles: RolesResolver } },
  {path: 'view-all-roles',component: ViewRolesComponent },
  {path: 'view-all-users',component: ViewUsersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRolesRoutingModule { }
