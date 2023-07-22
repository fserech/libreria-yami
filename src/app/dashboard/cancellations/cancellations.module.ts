import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancellationsRoutingModule } from './cancellations-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CancellationsRoutingModule,
    SharedModule
  ]
})
export class CancellationsModule { }
