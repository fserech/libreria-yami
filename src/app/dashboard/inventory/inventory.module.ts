import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { HistoryInventoryComponent } from './components/history-inventory/history-inventory.component';
import { StockComponent } from './components/stock/stock.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    HistoryInventoryComponent,
    StockComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }
