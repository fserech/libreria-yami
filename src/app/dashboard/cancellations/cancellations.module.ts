import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancellationsRoutingModule } from './cancellations-routing.module';
import { CancellationSalesComponent } from './components/cancellation-sales/cancellation-sales.component';
import { CancellationShoppingComponent } from './components/cancellation-shopping/cancellation-shopping.component';
import { CancellationStockComponent } from './components/cancellation-stock/cancellation-stock.component';


@NgModule({
  declarations: [
    CancellationSalesComponent,
    CancellationShoppingComponent,
    CancellationStockComponent
  ],
  imports: [
    CommonModule,
    CancellationsRoutingModule
  ]
})
export class CancellationsModule { }
