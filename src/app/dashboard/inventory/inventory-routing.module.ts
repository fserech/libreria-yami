import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryInventoryComponent } from './components/history-inventory/history-inventory.component';
import { StockComponent } from './components/stock/stock.component';

const routes: Routes = [
  {path: '', component: StockComponent},
  {path: 'history-inventory', component: StockComponent},
  {path: 'stock-inventory', component: HistoryInventoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
