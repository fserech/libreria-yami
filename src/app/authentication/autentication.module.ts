import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticationRoutingModule } from './autentication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { LoginComponent } from './components/login/login.component';


@NgModule({
  declarations: [
    ForgetPasswordComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    AutenticationRoutingModule,
    SharedModule
  ]
})
export class AutenticationModule { }
