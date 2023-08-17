import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRolesRoutingModule } from './users-roles-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewRolComponent } from './components/new-rol/new-rol.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { ViewRolesComponent } from './components/view-roles/view-roles.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';
import { UsersRolesComponent } from './users-roles.component';


@NgModule({
  declarations: [
    NewRolComponent,
    NewUserComponent,
    ViewRolesComponent,
    ViewUsersComponent,
    UsersRolesComponent
  ],
  imports: [
    CommonModule,
    UsersRolesRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersRolesModule { }
