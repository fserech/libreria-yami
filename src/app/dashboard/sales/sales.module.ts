import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { HistorySalesComponent } from './components/history-sales/history-sales.component';
import { MySalesComponent } from './components/my-sales/my-sales.component';
import { NewSaleComponent } from './components/new-sale/new-sale.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    HistorySalesComponent,
    MySalesComponent,
    NewSaleComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    SharedModule
  ]
})
export class SalesModule { }
