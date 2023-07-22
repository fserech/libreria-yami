import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticationRoutingModule } from './autentication-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { LoginComponent } from './components/login/login.component';
import { AuthenticationComponent } from './authentication.component';


@NgModule({
  declarations: [
    AuthenticationComponent,
    ForgetPasswordComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    AutenticationRoutingModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AutenticationModule { }
