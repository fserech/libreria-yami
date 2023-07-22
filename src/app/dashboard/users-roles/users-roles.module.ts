import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRolesRoutingModule } from './users-roles-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UsersRolesRoutingModule,
    SharedModule
  ]
})
export class UsersRolesModule { }
