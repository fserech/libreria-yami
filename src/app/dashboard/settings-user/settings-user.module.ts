import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsUserRoutingModule } from './settings-user-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SettingsUserRoutingModule,
    SharedModule
  ]
})
export class SettingsUserModule { }
