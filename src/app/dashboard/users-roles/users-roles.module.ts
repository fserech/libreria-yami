import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRolesRoutingModule } from './users-roles-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewRolComponent } from './components/new-rol/new-rol.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { ViewRolesComponent } from './components/view-roles/view-roles.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';


@NgModule({
  declarations: [
    NewRolComponent,
    NewUserComponent,
    ViewRolesComponent,
    ViewUsersComponent
  ],
  imports: [
    CommonModule,
    UsersRolesRoutingModule,
    SharedModule
  ]
})
export class UsersRolesModule { }
