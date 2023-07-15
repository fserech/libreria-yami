import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShoppingRoutingModule } from './shopping-routing.module';
import { HistoryShoppingComponent } from './components/history-shopping/history-shopping.component';
import { NewShoppingComponent } from './components/new-shopping/new-shopping.component';


@NgModule({
  declarations: [
    HistoryShoppingComponent,
    NewShoppingComponent
  ],
  imports: [
    CommonModule,
    ShoppingRoutingModule
  ]
})
export class ShoppingModule { }
